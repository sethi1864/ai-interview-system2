const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { validateInterviewStart, validateInterviewResponse } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for interview endpoints
const interviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 interview requests per windowMs
  message: {
    error: 'Too many interview requests, please try again later.'
  }
});

// Apply rate limiting to interview endpoints
router.use(interviewLimiter);

// Start a new interview
router.post('/start', validateInterviewStart, interviewController.startInterview);

// Process candidate response
router.post('/respond', validateInterviewResponse, interviewController.processResponse);

// Get interview details
router.get('/:interviewId', interviewController.getInterview);

// End interview
router.post('/:interviewId/end', interviewController.endInterview);

// Get active interviews
router.get('/active/list', interviewController.getActiveInterviews);

// Get interview statistics
router.get('/stats/overview', interviewController.getInterviewStats);

// Get interview analytics
router.get('/:interviewId/analytics', interviewController.getInterviewAnalytics);

// Resume interview (if paused)
router.post('/:interviewId/resume', interviewController.resumeInterview);

// Pause interview
router.post('/:interviewId/pause', interviewController.pauseInterview);

// Get interview transcript
router.get('/:interviewId/transcript', interviewController.getInterviewTranscript);

// Export interview data
router.get('/:interviewId/export', interviewController.exportInterviewData);

module.exports = router;