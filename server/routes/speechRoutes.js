const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');

// Convert text to speech
router.post('/synthesize', speechController.synthesizeSpeech);

// Convert speech to text
router.post('/recognize', speechController.recognizeSpeech);

// Get available voices
router.get('/voices', speechController.getAvailableVoices);

// Generate speech with emotion
router.post('/synthesize/emotion', speechController.synthesizeSpeechWithEmotion);

// Health check for speech services
router.get('/health', speechController.healthCheck);

module.exports = router;