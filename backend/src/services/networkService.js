const mongoose = require('mongoose');
const CrimeIncident = require('../models/CrimeIncident');
const CrimeType = require('../models/CrimeType');
const District = require('../models/District');
const PoliceStation = require('../models/PoliceStation');
const ModusOperandi = require('../models/ModusOperandi');
const Suspect = require('../models/Suspect');
const Victim = require('../models/Victim');

class NetworkService {
  static async getGraph(filters = {}) {
    try {
      console.log('🔍 Building criminological network graph...');
      const nodes = [];
      const edges = [];
      const nodeSet = new Set();
      const edgeSet = new Set();

      // Fetch crimes with populated references
      const crimes = await CrimeIncident.find({ deletedAt: null })
        .populate('crimeType location.address.district location.address.policeStation victims suspects modusOperandi')
        .limit(filters.limit || 150)
        .lean();

      // Location & MO tracker maps to prevent duplicates
      const locationMap = {};
      const moMap = {};

      crimes.forEach(c => {
        const crimeId = `crime_${c._id}`;

        // 1. Add Crime Node
        if (!nodeSet.has(crimeId)) {
          nodes.push({
            id: crimeId,
            type: 'crime',
            label: c.firNumber || `FIR-${c.incidentId || 'INC'}`,
            category: 'FIR Incident',
            color: '#1976d2',
            data: {
              ...c,
              type: 'crime',
              title: c.firNumber,
              crimeTypeName: c.crimeType?.name || 'Crime Incident',
              districtName: c.location?.address?.district?.name || 'Karnataka',
              severity: c.severity || 'medium',
              status: c.status || 'reported',
              date: c.date
            }
          });
          nodeSet.add(crimeId);
        }

        // 2. Add Location Node & Edge
        const distName = c.location?.address?.district?.name || c.location?.address?.city || 'Karnataka District';
        const locId = `location_${distName.toLowerCase().replace(/\s+/g, '_')}`;
        if (!nodeSet.has(locId)) {
          nodes.push({
            id: locId,
            type: 'location',
            label: distName,
            category: 'Location',
            color: '#ff9800',
            data: {
              type: 'location',
              name: distName,
              policeStation: c.location?.address?.policeStation?.name || 'District Station'
            }
          });
          nodeSet.add(locId);
        }

        const locEdgeId = `e_${crimeId}_${locId}`;
        if (!edgeSet.has(locEdgeId)) {
          edges.push({
            id: locEdgeId,
            source: crimeId,
            target: locId,
            type: 'occurred_at',
            label: 'OCCURRED_AT',
            color: '#ff9800',
            strength: 4
          });
          edgeSet.add(locEdgeId);
        }

        // 3. Add Modus Operandi Node & Edge
        const moText = c.modusOperandi?.tactics || c.description?.substring(0, 30) || 'Standard MO';
        const moSlug = moText.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 25);
        const moId = `mo_${moSlug}`;

        if (!nodeSet.has(moId)) {
          nodes.push({
            id: moId,
            type: 'mo',
            label: `MO: ${moText.substring(0, 25)}`,
            category: 'Modus Operandi',
            color: '#9c27b0',
            data: {
              type: 'mo',
              tactics: moText,
              entryPoint: c.modusOperandi?.entryPoint || 'N/A',
              toolsUsed: c.modusOperandi?.toolsUsed || 'N/A'
            }
          });
          nodeSet.add(moId);
        }

        const moEdgeId = `e_${crimeId}_${moId}`;
        if (!edgeSet.has(moEdgeId)) {
          edges.push({
            id: moEdgeId,
            source: crimeId,
            target: moId,
            type: 'used_mo',
            label: 'USED_MO',
            color: '#9c27b0',
            strength: 6
          });
          edgeSet.add(moEdgeId);
        }

        // 4. Add Suspect Nodes & Edges
        const suspects = c.suspects || [];
        const suspectIdList = [];

        suspects.forEach(s => {
          if (!s || !s._id) return;
          const sId = `suspect_${s._id}`;
          suspectIdList.push(sId);

          if (!nodeSet.has(sId)) {
            const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.aliasName || 'Unknown Offender';
            nodes.push({
              id: sId,
              type: 'suspect',
              label: fullName,
              category: 'Suspect',
              color: '#e91e63',
              data: {
                ...s,
                type: 'suspect',
                fullName,
                alias: s.aliasName || 'N/A',
                status: s.status || 'Active',
                phone: s.contactNumber || s.phone || 'N/A'
              }
            });
            nodeSet.add(sId);
          }

          const sEdgeId = `e_${sId}_${crimeId}`;
          if (!edgeSet.has(sEdgeId)) {
            edges.push({
              id: sEdgeId,
              source: sId,
              target: crimeId,
              type: 'suspect_in',
              label: 'SUSPECT_IN',
              color: '#e91e63',
              strength: 8
            });
            edgeSet.add(sEdgeId);
          }
        });

        // 5. Add Co-Offender Edges (Suspect ↔ Suspect)
        for (let i = 0; i < suspectIdList.length; i++) {
          for (let j = i + 1; j < suspectIdList.length; j++) {
            const coEdgeId = `e_co_${suspectIdList[i]}_${suspectIdList[j]}`;
            if (!edgeSet.has(coEdgeId)) {
              edges.push({
                id: coEdgeId,
                source: suspectIdList[i],
                target: suspectIdList[j],
                type: 'co_offender',
                label: 'CO_OFFENDER',
                color: '#d32f2f',
                strength: 9
              });
              edgeSet.add(coEdgeId);
            }
          }
        }

        // 6. Add Victim Nodes & Edges
        if (c.victims && Array.isArray(c.victims)) {
          c.victims.forEach(v => {
            if (!v || !v._id) return;
            const vId = `victim_${v._id}`;

            if (!nodeSet.has(vId)) {
              const vName = `${v.firstName || ''} ${v.lastName || ''}`.trim() || 'Victim';
              nodes.push({
                id: vId,
                type: 'victim',
                label: vName,
                category: 'Victim',
                color: '#4caf50',
                data: {
                  ...v,
                  type: 'victim',
                  fullName: vName
                }
              });
              nodeSet.add(vId);
            }

            const vEdgeId = `e_${vId}_${crimeId}`;
            if (!edgeSet.has(vEdgeId)) {
              edges.push({
                id: vEdgeId,
                source: vId,
                target: crimeId,
                type: 'victim_of',
                label: 'VICTIM_OF',
                color: '#4caf50',
                strength: 5
              });
              edgeSet.add(vEdgeId);
            }
          });
        }
      });

      // 7. Fallback: Fetch standalone suspects if not already added
      const standaloneSuspects = await Suspect.find({}).limit(50).lean();
      standaloneSuspects.forEach(s => {
        const sId = `suspect_${s._id}`;
        if (!nodeSet.has(sId)) {
          const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.aliasName || 'Unknown Suspect';
          nodes.push({
            id: sId,
            type: 'suspect',
            label: fullName,
            category: 'Suspect',
            color: '#e91e63',
            data: {
              ...s,
              type: 'suspect',
              fullName,
              alias: s.aliasName || 'N/A',
              status: s.status || 'Active'
            }
          });
          nodeSet.add(sId);
        }
      });

      console.log(`📊 Generated Graph: ${nodes.length} nodes, ${edges.length} edges`);
      return { nodes, edges };
    } catch (error) {
      console.error('Error building graph in NetworkService:', error);
      return { nodes: [], edges: [] };
    }
  }

  static async getNodes(filters = {}) {
    const graph = await this.getGraph(filters);
    return graph.nodes;
  }

  static async getEdges(filters = {}) {
    const graph = await this.getGraph(filters);
    return graph.edges;
  }

  static async getRepeatOffenders() {
    try {
      const crimes = await CrimeIncident.find({ deletedAt: null })
        .populate('suspects crimeType location.address.district location.address.policeStation')
        .lean();

      const suspectMap = {};

      crimes.forEach(c => {
        if (c.suspects && Array.isArray(c.suspects)) {
          c.suspects.forEach(s => {
            const id = s._id.toString();
            if (!suspectMap[id]) {
              suspectMap[id] = {
                id: s._id,
                name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.aliasName || 'Unknown Offender',
                alias: s.aliasName || 'N/A',
                status: s.status || 'Active',
                crimesCount: 0,
                firs: [],
                districts: new Set(),
                policeStations: new Set(),
                moTactics: new Set(),
                severityScore: 0
              };
            }

            suspectMap[id].crimesCount += 1;
            suspectMap[id].firs.push(c.firNumber || c.incidentId);

            if (c.location?.address?.district?.name) {
              suspectMap[id].districts.add(c.location.address.district.name);
            }
            if (c.location?.address?.policeStation?.name) {
              suspectMap[id].policeStations.add(c.location.address.policeStation.name);
            }
            if (c.modusOperandi?.tactics) {
              suspectMap[id].moTactics.add(c.modusOperandi.tactics);
            } else if (c.description) {
              suspectMap[id].moTactics.add(c.description.substring(0, 40) + '...');
            }

            const sevWeight = c.severity === 'critical' ? 10 : c.severity === 'high' ? 7 : c.severity === 'medium' ? 5 : 3;
            suspectMap[id].severityScore += sevWeight;
          });
        }
      });

      // Filter repeat offenders (crimesCount >= 1 or top weighted) and format sets
      const offenders = Object.values(suspectMap)
        .map(o => ({
          ...o,
          districts: Array.from(o.districts),
          policeStations: Array.from(o.policeStations),
          moTactics: Array.from(o.moTactics),
          crossJurisdiction: o.policeStations.size > 1 || o.districts.size > 1
        }))
        .sort((a, b) => b.crimesCount - a.crimesCount || b.severityScore - a.severityScore);

      return offenders;
    } catch (error) {
      console.error('Error in getRepeatOffenders:', error);
      return [];
    }
  }
}

module.exports = NetworkService;