const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const AuthMiddleware = require('../middlewares/auth');

// Public or Authenticated Report Endpoints
router.get('/', ReportController.getAllReports);
router.post('/generate', ReportController.generateReport);
router.get('/:id', ReportController.getReportById);
router.delete('/:id', ReportController.deleteReport);

module.exports = router;
