/**
 * Network Controller - Handles network analysis HTTP requests
 */

const NetworkService = require('../services/networkService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class NetworkController {
  /**
   * Get network nodes
   */
  static async getNodes(req, res) {
    try {
      const { depth, limit, minStrength, type } = req.query;
      
      const filters = { 
        depth: parseInt(depth) || 2,
        limit: parseInt(limit) || 100,
        minStrength: parseInt(minStrength) || 1,
        type: type || 'all'
      };
      
      const nodes = await NetworkService.getNodes(filters);
      return ResponseHandler.success(res, nodes, 'Nodes fetched successfully');
    } catch (error) {
      logger.error('Get nodes error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch nodes');
    }
  }

  /**
   * Get network edges
   */
  static async getEdges(req, res) {
    try {
      const { depth, limit, minStrength, type } = req.query;
      
      const filters = {
        depth: parseInt(depth) || 2,
        limit: parseInt(limit) || 200,
        minStrength: parseInt(minStrength) || 1,
        type: type || 'all'
      };
      
      const edges = await NetworkService.getEdges(filters);
      return ResponseHandler.success(res, edges, 'Edges fetched successfully');
    } catch (error) {
      logger.error('Get edges error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch edges');
    }
  }

  /**
   * Get full graph
   */
  static async getGraph(req, res) {
    try {
      const { depth, limit, minStrength, type } = req.query;
      
      const filters = {
        depth: parseInt(depth) || 2,
        limit: parseInt(limit) || 100,
        minStrength: parseInt(minStrength) || 1,
        type: type || 'all'
      };
      
      const graph = await NetworkService.getGraph(filters);
      return ResponseHandler.success(res, graph, 'Graph fetched successfully');
    } catch (error) {
      logger.error('Get graph error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch graph');
    }
  }

  /**
   * Find path between nodes
   */
  static async findPath(req, res) {
    try {
      const { source, target, maxDepth } = req.query;
      
      const result = await NetworkService.findPath(source, target, parseInt(maxDepth) || 5);
      
      if (result.found) {
        return ResponseHandler.success(res, result, 'Path found');
      } else {
        return ResponseHandler.success(res, result, 'No path found');
      }
    } catch (error) {
      logger.error('Find path error:', error);
      return ResponseHandler.error(res, error, 'Failed to find path');
    }
  }

  /**
   * Get node centrality
   */
  static async getCentrality(req, res) {
    try {
      const { id } = req.params;
      
      const centrality = await NetworkService.getCentrality(id);
      return ResponseHandler.success(res, centrality, 'Centrality calculated successfully');
    } catch (error) {
      logger.error('Get centrality error:', error);
      return ResponseHandler.error(res, error, 'Failed to calculate centrality');
    }
  }

  /**
   * Detect communities
   */
  static async getCommunities(req, res) {
    try {
      const { algorithm, minCommunitySize } = req.query;
      
      const filters = {
        algorithm: algorithm || 'louvain',
        minCommunitySize: parseInt(minCommunitySize) || 2
      };
      
      const communities = await NetworkService.detectCommunities(filters);
      return ResponseHandler.success(res, communities, 'Communities detected successfully');
    } catch (error) {
      logger.error('Detect communities error:', error);
      return ResponseHandler.error(res, error, 'Failed to detect communities');
    }
  }

  /**
   * Get suspect's network
   */
  static async getSuspectNetwork(req, res) {
    try {
      const { id } = req.params;
      const { depth } = req.query;
      
      const network = await NetworkService.getSuspectNetwork(id, parseInt(depth) || 2);
      return ResponseHandler.success(res, network, 'Suspect network fetched successfully');
    } catch (error) {
      logger.error('Get suspect network error:', error);
      
      if (error.message === 'Suspect not found') {
        return ResponseHandler.notFound(res, error.message);
      }
      
      return ResponseHandler.error(res, error, 'Failed to fetch suspect network');
    }
  }

  /**
   * Get crime network
   */
  static async getCrimeNetwork(req, res) {
    try {
      const { id } = req.params;
      const { depth } = req.query;
      
      const network = await NetworkService.getCrimeNetwork(id, parseInt(depth) || 2);
      return ResponseHandler.success(res, network, 'Crime network fetched successfully');
    } catch (error) {
      logger.error('Get crime network error:', error);
      
      if (error.message === 'Crime not found') {
        return ResponseHandler.notFound(res, error.message);
      }
      
      return ResponseHandler.error(res, error, 'Failed to fetch crime network');
    }
  }

  /**
   * Get network statistics
   */
  static async getStats(req, res) {
    try {
      const stats = await NetworkService.getNetworkStats();
      return ResponseHandler.success(res, stats, 'Network statistics fetched successfully');
    } catch (error) {
      logger.error('Get network stats error:', error);
      return ResponseHandler.error(res, error, 'Failed to fetch network statistics');
    }
  }
}

module.exports = NetworkController;