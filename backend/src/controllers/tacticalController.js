/**
 * Tactical Intelligence Controller
 * Exposes all 6 advanced law enforcement intelligence capabilities
 */

const TacticalService = require('../services/tacticalService');
const logger = require('../utils/logger');

class TacticalController {
  /**
   * 1. Get Modus Operandi Pattern Clusters
   */
  static async getMoPatterns(req, res, next) {
    try {
      const data = await TacticalService.getMoPatterns();
      res.json({
        success: true,
        message: 'M.O. pattern clusters retrieved successfully',
        data
      });
    } catch (error) {
      logger.error('Error in getMoPatterns:', error);
      next(error);
    }
  }

  /**
   * 1.1 Match M.O. Linkage for incident
   */
  static async matchMoLinkage(req, res, next) {
    try {
      const query = {
        crimeId: req.query?.crimeId || req.body?.crimeId,
        keywords: req.query?.keywords || req.body?.keywords,
        crimeType: req.query?.crimeType || req.body?.crimeType,
        district: req.query?.district || req.body?.district
      };
      const data = await TacticalService.matchMoLinkage(query);
      res.json({
        success: true,
        message: 'M.O. linkage analysis generated',
        data
      });
    } catch (error) {
      logger.error('Error in matchMoLinkage:', error);
      next(error);
    }
  }

  /**
   * 2. Predictive Patrol Route Generator
   */
  static async getPatrolRoute(req, res, next) {
    try {
      const params = {
        district: req.query?.district || req.body?.district || 'Bengaluru Urban',
        shift: req.query?.shift || req.body?.shift || 'night',
        unit: req.query?.unit || req.body?.unit || 'PCR Interceptor-04'
      };
      const data = await TacticalService.generatePatrolRoute(params);
      res.json({
        success: true,
        message: 'Predictive patrol route generated',
        data
      });
    } catch (error) {
      logger.error('Error in getPatrolRoute:', error);
      next(error);
    }
  }

  /**
   * 3. Biometrics & Facial / Sketch Recognition Desk
   */
  static async getBiometrics(req, res, next) {
    try {
      const data = await TacticalService.getBiometricCases();
      res.json({
        success: true,
        message: 'Biometric case analysis loaded',
        data
      });
    } catch (error) {
      logger.error('Error in getBiometrics:', error);
      next(error);
    }
  }

  /**
   * 4. CDR & Tower Dump Co-Location Matrix
   */
  static async getCdrAnalysis(req, res, next) {
    try {
      const data = await TacticalService.getCdrAnalysis();
      res.json({
        success: true,
        message: 'CDR co-location matrix computed',
        data
      });
    } catch (error) {
      logger.error('Error in getCdrAnalysis:', error);
      next(error);
    }
  }

  /**
   * 5. Tactical BOLO Desk & Interstate Checkpoints
   */
  static async getBoloAlerts(req, res, next) {
    try {
      const data = await TacticalService.getBoloAlerts();
      res.json({
        success: true,
        message: 'Active BOLO alerts retrieved',
        data
      });
    } catch (error) {
      logger.error('Error in getBoloAlerts:', error);
      next(error);
    }
  }

  /**
   * 6. Digital Evidence Locker & Chain of Custody
   */
  static async getEvidenceLocker(req, res, next) {
    try {
      const data = await TacticalService.getEvidenceLocker();
      res.json({
        success: true,
        message: 'Cryptographic evidence locker retrieved',
        data
      });
    } catch (error) {
      logger.error('Error in getEvidenceLocker:', error);
      next(error);
    }
  }

  /**
   * 6.1 Verify Evidence Hash
   */
  static async verifyHash(req, res, next) {
    try {
      const { evidenceId, hash } = req.body || req.query || {};
      const data = TacticalService.verifyHash(evidenceId, hash);
      res.json({
        success: true,
        message: data.verified ? 'Evidence integrity verified' : 'Hash verification failed',
        data
      });
    } catch (error) {
      logger.error('Error in verifyHash:', error);
      next(error);
    }
  }
}

module.exports = TacticalController;
