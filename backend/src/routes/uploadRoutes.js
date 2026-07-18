const express = require('express');
const router = express.Router();
const { UploadController, upload } = require('../controllers/uploadController');
const AuthMiddleware = require('../middlewares/auth');

// Upload data file
router.post(
  '/upload',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('admin'),
  upload.single('file'),
  UploadController.uploadData
);

module.exports = router;
