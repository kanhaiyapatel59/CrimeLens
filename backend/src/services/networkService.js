/**
 * Network Service - Business logic for criminal network analysis
 * Uses graph algorithms to detect relationships and patterns
 */

const mongoose = require('mongoose');
const CrimeIncident = require('../models/CrimeIncident');
const Suspect = require('../models/Suspect');
const Offender = require('../models/Offender');
const Victim = require('../models/Victim');
const Association = require('../models/Association');
const CriminalNetwork = require('../models/CriminalNetwork');
const logger = require('../utils/logger');

class NetworkService {
  /**
   * Get network nodes
   */
  static async getNodes(filters = {}) {
    const nodes = [];
    const nodeMap = new Map();

    // Get suspects
    const suspects = await Suspect.find({
      status: { $ne: 'cleared' },
      deletedAt: null
    })
    .limit(filters.limit || 100)
    .lean();

    suspects.forEach(s => {
      nodeMap.set(s._id.toString(), {
        id: s._id.toString(),
        type: 'suspect',
        label: `${s.firstName} ${s.lastName}`,
        size: s.riskAssessment?.score || 5,
        color: '#FF6B6B',
        data: s,
        attributes: {
          status: s.status,
          riskScore: s.riskAssessment?.score || 0,
          crimeCount: s.currentCrimes?.length || 0
        }
      });
    });

    // Get offenders
    const offenders = await Offender.find({
      deletedAt: null
    })
    .limit(filters.limit || 100)
    .lean();

    offenders.forEach(o => {
      nodeMap.set(o._id.toString(), {
        id: o._id.toString(),
        type: 'offender',
        label: `${o.firstName} ${o.lastName}`,
        size: 7 + (o.criminalProfile?.numberOfConvictions || 0) * 0.5,
        color: '#E74C3C',
        data: o,
        attributes: {
          status: o.status,
          recidivismRisk: o.riskPrediction?.recidivismRisk?.level || 'low',
          convictions: o.criminalProfile?.numberOfConvictions || 0
        }
      });
    });

    // Get victims (only those with relationships)
    const victims = await Victim.find({
      'relationships.0': { $exists: true },
      deletedAt: null
    })
    .limit(filters.limit || 50)
    .lean();

    victims.forEach(v => {
      nodeMap.set(v._id.toString(), {
        id: v._id.toString(),
        type: 'victim',
        label: `${v.firstName} ${v.lastName}`,
        size: 3,
        color: '#4ECDC4',
        data: v,
        attributes: {
          isRepeatVictim: v.isRepeatVictim,
          protectionStatus: v.protectionStatus
        }
      });
    });

    // Get locations as nodes
    const locations = await CrimeIncident.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$location.address.district',
          count: { $sum: 1 },
          coordinates: { $first: '$location.coordinates' }
        }
      },
      { $limit: filters.limit || 50 },
      {
        $lookup: {
          from: 'districts',
          localField: '_id',
          foreignField: '_id',
          as: 'district'
        }
      },
      { $unwind: '$district' }
    ]);

    locations.forEach(l => {
      nodeMap.set(`loc_${l._id.toString()}`, {
        id: `loc_${l._id.toString()}`,
        type: 'location',
        label: l.district.name,
        size: Math.min(5 + l.count * 0.1, 15),
        color: '#45B7D1',
        data: l,
        attributes: {
          crimeCount: l.count,
          coordinates: l.coordinates
        }
      });
    });

    return Array.from(nodeMap.values());
  }

  /**
   * Get network edges (relationships)
   */
  static async getEdges(filters = {}) {
    const edges = [];
    const edgeMap = new Map();

    // Get associations from database
    const associations = await Association.find({
      status: { $in: ['confirmed', 'active'] },
      strength: { $gte: filters.minStrength || 1 }
    })
    .limit(filters.limit || 200)
    .lean();

    associations.forEach(a => {
      const key = `${a.entity1.id.toString()}_${a.entity2.id.toString()}`;
      const reverseKey = `${a.entity2.id.toString()}_${a.entity1.id.toString()}`;
      
      if (!edgeMap.has(key) && !edgeMap.has(reverseKey)) {
        edgeMap.set(key, {
          source: a.entity1.id.toString(),
          target: a.entity2.id.toString(),
          type: a.type,
          strength: a.strength,
          label: a.relationship.category,
          color: a.visualization?.edgeColor || '#95A5A6',
          data: a
        });
      }
    });

    // Generate additional edges from crime involvement
    const crimes = await CrimeIncident.find({
      deletedAt: null,
      $or: [
        { victims: { $exists: true, $ne: [] } },
        { suspects: { $exists: true, $ne: [] } },
        { offenders: { $exists: true, $ne: [] } }
      ]
    })
    .limit(50)
    .populate('victims suspects offenders')
    .lean();

    crimes.forEach(crime => {
      const participants = [
        ...(crime.victims || []).map(v => ({ id: v._id.toString(), type: 'victim' })),
        ...(crime.suspects || []).map(s => ({ id: s._id.toString(), type: 'suspect' })),
        ...(crime.offenders || []).map(o => ({ id: o._id.toString(), type: 'offender' }))
      ];

      // Connect all participants to the crime
      participants.forEach(p => {
        const key = `${p.id}_crime_${crime._id.toString()}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            source: p.id,
            target: `crime_${crime._id.toString()}`,
            type: 'involved_in',
            strength: 3,
            label: 'involved',
            color: '#3498DB',
            data: { crimeId: crime._id }
          });
        }
      });

      // Connect participants to each other (co-occurrence)
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const key = `${participants[i].id}_${participants[j].id}`;
          const reverseKey = `${participants[j].id}_${participants[i].id}`;
          
          if (!edgeMap.has(key) && !edgeMap.has(reverseKey)) {
            edgeMap.set(key, {
              source: participants[i].id,
              target: participants[j].id,
              type: 'co_occurrence',
              strength: 2,
              label: 'connected',
              color: '#9B59B6',
              data: { crimeId: crime._id }
            });
          }
        }
      }
    });

    return Array.from(edgeMap.values());
  }

  /**
   * Get full graph data
   */
  static async getGraph(filters = {}) {
    const [nodes, edges] = await Promise.all([
      this.getNodes(filters),
      this.getEdges(filters)
    ]);

    return {
      nodes,
      edges,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        density: nodes.length > 0 
          ? (edges.length / (nodes.length * (nodes.length - 1) / 2)) * 100 
          : 0
      }
    };
  }

  /**
   * Find paths between two nodes
   */
  static async findPath(sourceId, targetId, maxDepth = 5) {
    // Build adjacency list from associations
    const associations = await Association.find({
      $or: [
        { 'entity1.id': sourceId },
        { 'entity2.id': sourceId },
        { 'entity1.id': targetId },
        { 'entity2.id': targetId }
      ],
      status: { $in: ['confirmed', 'active'] }
    }).lean();

    const graph = new Map();

    associations.forEach(a => {
      const from = a.entity1.id.toString();
      const to = a.entity2.id.toString();
      
      if (!graph.has(from)) graph.set(from, []);
      if (!graph.has(to)) graph.set(to, []);
      
      graph.get(from).push({ node: to, weight: a.strength });
      graph.get(to).push({ node: from, weight: a.strength });
    });

    // BFS to find path
    const queue = [{ node: sourceId, path: [sourceId] }];
    const visited = new Set([sourceId]);

    while (queue.length > 0) {
      const { node, path } = queue.shift();

      if (node === targetId) {
        return {
          found: true,
          path: path,
          length: path.length - 1,
          nodes: path
        };
      }

      if (path.length >= maxDepth) continue;

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          queue.push({
            node: neighbor.node,
            path: [...path, neighbor.node]
          });
        }
      }
    }

    return {
      found: false,
      path: [],
      length: 0,
      message: 'No path found'
    };
  }

  /**
   * Calculate node centrality
   */
  static async getCentrality(nodeId) {
    // Get all associations for this node
    const associations = await Association.find({
      $or: [
        { 'entity1.id': nodeId },
        { 'entity2.id': nodeId }
      ],
      status: { $in: ['confirmed', 'active'] }
    }).lean();

    // Get all nodes connected to this node
    const connectedNodes = new Set();
    associations.forEach(a => {
      if (a.entity1.id.toString() === nodeId) {
        connectedNodes.add(a.entity2.id.toString());
      } else {
        connectedNodes.add(a.entity1.id.toString());
      }
    });

    // Calculate degree centrality
    const degree = connectedNodes.size;

    // Calculate weighted degree (strength)
    let weightedDegree = 0;
    associations.forEach(a => {
      weightedDegree += a.strength || 1;
    });

    // Get the node's role in the network
    const nodeType = await this.getNodeType(nodeId);

    return {
      nodeId,
      nodeType,
      degree,
      weightedDegree,
      connectedNodes: Array.from(connectedNodes),
      centrality: {
        degree: degree,
        weightedDegree: weightedDegree,
        betweenness: 0, // Would need full graph calculation
        closeness: 0    // Would need full graph calculation
      }
    };
  }

  /**
   * Detect communities in the network
   */
  static async detectCommunities(filters = {}) {
    const algorithm = filters.algorithm || 'louvain';
    const minSize = filters.minCommunitySize || 2;

    // Get all associations
    const associations = await Association.find({
      status: { $in: ['confirmed', 'active'] }
    }).limit(500).lean();

    // Build graph
    const graph = new Map();
    const nodes = new Set();

    associations.forEach(a => {
      const from = a.entity1.id.toString();
      const to = a.entity2.id.toString();
      
      nodes.add(from);
      nodes.add(to);
      
      if (!graph.has(from)) graph.set(from, new Set());
      if (!graph.has(to)) graph.set(to, new Set());
      
      graph.get(from).add(to);
      graph.get(to).add(from);
    });

    // Simple community detection using connected components
    // For production, use proper algorithms like Louvain
    const communities = [];
    const visited = new Set();

    for (const node of nodes) {
      if (!visited.has(node)) {
        const community = [];
        const queue = [node];
        visited.add(node);

        while (queue.length > 0) {
          const current = queue.shift();
          community.push(current);
          
          const neighbors = graph.get(current) || new Set();
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }

        if (community.length >= minSize) {
          communities.push(community);
        }
      }
    }

    // Get node types for each community
    const communitiesWithMetadata = await Promise.all(
      communities.map(async (community) => {
        const nodeTypes = await Promise.all(
          community.map(id => this.getNodeType(id))
        );
        
        const typeCount = {};
        nodeTypes.forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });

        return {
          id: `community_${communities.indexOf(community)}`,
          size: community.length,
          nodes: community,
          composition: typeCount,
          dominantType: Object.keys(typeCount).reduce((a, b) => 
            typeCount[a] > typeCount[b] ? a : b
          )
        };
      })
    );

    return {
      algorithm,
      communityCount: communities.length,
      communities: communitiesWithMetadata,
      metadata: {
        totalNodes: nodes.size,
        averageCommunitySize: communities.reduce((acc, c) => acc + c.length, 0) / communities.length
      }
    };
  }

  /**
   * Get suspect's network
   */
  static async getSuspectNetwork(suspectId, depth = 2) {
    const suspect = await Suspect.findById(suspectId).lean();
    if (!suspect) {
      throw new Error('Suspect not found');
    }

    // Get all associations for this suspect
    const associations = await Association.find({
      $or: [
        { 'entity1.id': suspectId, 'entity1.model': 'Suspect' },
        { 'entity2.id': suspectId, 'entity2.model': 'Suspect' }
      ]
    }).lean();

    // Build network
    const network = {
      nodes: [
        {
          id: suspectId,
          type: 'suspect',
          label: `${suspect.firstName} ${suspect.lastName}`,
          size: 8,
          color: '#E74C3C',
          data: suspect
        }
      ],
      edges: []
    };

    // Add connected nodes
    for (const assoc of associations) {
      let connectedId;
      let model;
      
      if (assoc.entity1.id.toString() === suspectId) {
        connectedId = assoc.entity2.id.toString();
        model = assoc.entity2.model;
      } else {
        connectedId = assoc.entity1.id.toString();
        model = assoc.entity1.model;
      }

      // Get node data
      let nodeData;
      if (model === 'Suspect') {
        nodeData = await Suspect.findById(connectedId).lean();
      } else if (model === 'Offender') {
        nodeData = await Offender.findById(connectedId).lean();
      } else if (model === 'Victim') {
        nodeData = await Victim.findById(connectedId).lean();
      }

      if (nodeData) {
        network.nodes.push({
          id: connectedId,
          type: model.toLowerCase(),
          label: `${nodeData.firstName} ${nodeData.lastName}`,
          size: model === 'Offender' ? 6 : 4,
          color: model === 'Suspect' ? '#E74C3C' : 
                  model === 'Offender' ? '#C0392B' : '#4ECDC4',
          data: nodeData
        });

        network.edges.push({
          source: suspectId,
          target: connectedId,
          type: assoc.type,
          strength: assoc.strength,
          label: assoc.relationship.category,
          color: '#95A5A6'
        });
      }
    }

    // Get crimes this suspect is involved in
    const crimes = await CrimeIncident.find({
      suspects: suspectId,
      deletedAt: null
    }).limit(5).lean();

    crimes.forEach(crime => {
      const crimeId = `crime_${crime._id.toString()}`;
      network.nodes.push({
        id: crimeId,
        type: 'crime',
        label: crime.firNumber,
        size: 5,
        color: '#3498DB',
        data: { firNumber: crime.firNumber, date: crime.date }
      });

      network.edges.push({
        source: suspectId,
        target: crimeId,
        type: 'involved',
        strength: 5,
        label: 'involved in',
        color: '#3498DB'
      });
    });

    return network;
  }

  /**
   * Get crime network
   */
  static async getCrimeNetwork(crimeId, depth = 2) {
    const crime = await CrimeIncident.findById(crimeId)
      .populate('victims suspects offenders')
      .lean();

    if (!crime) {
      throw new Error('Crime not found');
    }

    const network = {
      nodes: [
        {
          id: crimeId,
          type: 'crime',
          label: crime.firNumber,
          size: 10,
          color: '#3498DB',
          data: crime
        }
      ],
      edges: []
    };

    // Add victims
    const victims = crime.victims || [];
    victims.forEach(v => {
      network.nodes.push({
        id: v._id.toString(),
        type: 'victim',
        label: `${v.firstName} ${v.lastName}`,
        size: 4,
        color: '#4ECDC4',
        data: v
      });
      network.edges.push({
        source: v._id.toString(),
        target: crimeId,
        type: 'victim_of',
        strength: 5,
        label: 'victim of',
        color: '#4ECDC4'
      });
    });

    // Add suspects
    const suspects = crime.suspects || [];
    suspects.forEach(s => {
      network.nodes.push({
        id: s._id.toString(),
        type: 'suspect',
        label: `${s.firstName} ${s.lastName}`,
        size: 6,
        color: '#E74C3C',
        data: s
      });
      network.edges.push({
        source: s._id.toString(),
        target: crimeId,
        type: 'suspect_of',
        strength: 5,
        label: 'suspect of',
        color: '#E74C3C'
      });
    });

    // Add offenders
    const offenders = crime.offenders || [];
    offenders.forEach(o => {
      network.nodes.push({
        id: o._id.toString(),
        type: 'offender',
        label: `${o.firstName} ${o.lastName}`,
        size: 7,
        color: '#C0392B',
        data: o
      });
      network.edges.push({
        source: o._id.toString(),
        target: crimeId,
        type: 'offender_of',
        strength: 7,
        label: 'offender of',
        color: '#C0392B'
      });
    });

    return network;
  }

  /**
   * Get network statistics
   */
  static async getNetworkStats() {
    const [
      totalNodes,
      totalEdges,
      suspectCount,
      offenderCount,
      victimCount,
      crimeCount,
      networkCount
    ] = await Promise.all([
      Association.distinct('entity1.id').then(ids => ids.length),
      Association.countDocuments({ status: { $in: ['confirmed', 'active'] } }),
      Suspect.countDocuments({ deletedAt: null }),
      Offender.countDocuments({ deletedAt: null }),
      Victim.countDocuments({ deletedAt: null }),
      CrimeIncident.countDocuments({ deletedAt: null }),
      CriminalNetwork.countDocuments({ isActive: true })
    ]);

    // Get top associations
    const topAssociations = await Association.aggregate([
      { $match: { status: { $in: ['confirmed', 'active'] } } },
      { $group: { _id: '$relationship.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalNodes,
      totalEdges,
      entityCounts: {
        suspects: suspectCount,
        offenders: offenderCount,
        victims: victimCount,
        crimes: crimeCount
      },
      networkCount,
      density: totalNodes > 0 
        ? (totalEdges / (totalNodes * (totalNodes - 1) / 2)) * 100 
        : 0,
      topRelationshipTypes: topAssociations,
      averageDegree: totalNodes > 0 ? (totalEdges * 2 / totalNodes) : 0
    };
  }

  /**
   * Helper: Get node type
   */
  static async getNodeType(nodeId) {
    const models = ['Suspect', 'Offender', 'Victim', 'CrimeIncident', 'CriminalNetwork'];
    
    for (const model of models) {
      const Model = require(`../models/${model}`);
      const exists = await Model.exists({ _id: nodeId, deletedAt: null });
      if (exists) return model.toLowerCase();
    }
    
    return 'unknown';
  }
}

module.exports = NetworkService;