const mongoose = require('mongoose');
const CrimeIncident = require('../models/CrimeIncident');
const Suspect = require('../models/Suspect');
const Victim = require('../models/Victim');

class NetworkService {
  static async getNodes(filters = {}) {
    console.log('🔍 Fetching nodes...');
    const nodes = [];

    try {
      const suspects = await Suspect.find({}).limit(200).lean();
      console.log(`✅ Found ${suspects.length} suspects`);
      
      suspects.forEach(s => {
        nodes.push({
          id: s._id.toString(),
          type: 'suspect',
          label: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
          size: 5,
          color: '#FF6B6B',
          data: s
        });
      });

      const victims = await Victim.find({}).limit(200).lean();
      console.log(`✅ Found ${victims.length} victims`);
      
      victims.forEach(v => {
        nodes.push({
          id: v._id.toString(),
          type: 'victim',
          label: `${v.firstName || ''} ${v.lastName || ''}`.trim() || 'Unknown',
          size: 3,
          color: '#4ECDC4',
          data: v
        });
      });

      const crimes = await CrimeIncident.find({}).limit(200).lean();
      console.log(`✅ Found ${crimes.length} crimes`);
      
      crimes.forEach(c => {
        nodes.push({
          id: c._id.toString(),
          type: 'crime',
          label: c.firNumber || 'Unknown',
          size: 7,
          color: '#3498DB',
          data: c
        });
      });

      console.log(`📊 Total nodes: ${nodes.length}`);
      return nodes;
    } catch (error) {
      console.error('Error in getNodes:', error);
      return [];
    }
  }

  static async getEdges(filters = {}) {
    console.log('🔍 Fetching edges...');
    const edges = [];

    try {
      const crimes = await CrimeIncident.find({})
        .populate('victims suspects')
        .limit(200)
        .lean();

      crimes.forEach(crime => {
        if (crime.victims) {
          crime.victims.forEach(v => {
            edges.push({
              source: v._id.toString(),
              target: crime._id.toString(),
              type: 'victim_of',
              strength: 5,
              label: 'victim of',
              color: '#4ECDC4'
            });
          });
        }

        if (crime.suspects) {
          crime.suspects.forEach(s => {
            edges.push({
              source: s._id.toString(),
              target: crime._id.toString(),
              type: 'suspect_of',
              strength: 7,
              label: 'suspect of',
              color: '#FF6B6B'
            });
          });
        }
      });

      console.log(`📊 Total edges: ${edges.length}`);
      return edges;
    } catch (error) {
      console.error('Error in getEdges:', error);
      return [];
    }
  }

  static async getGraph(filters = {}) {
    const [nodes, edges] = await Promise.all([
      this.getNodes(filters),
      this.getEdges(filters)
    ]);

    return { nodes, edges };
  }

  // Add other methods as needed...
}

module.exports = NetworkService;