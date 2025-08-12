const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');

// Generate avatar video
router.post('/generate', avatarController.generateAvatarVideo);

// Get available avatars
router.get('/list', avatarController.getAvailableAvatars);

// Get avatar configuration
router.get('/config/:avatarId', avatarController.getAvatarConfig);

// Generate avatar preview
router.post('/preview', avatarController.generateAvatarPreview);

// Health check for avatar service
router.get('/health', avatarController.healthCheck);

module.exports = router;