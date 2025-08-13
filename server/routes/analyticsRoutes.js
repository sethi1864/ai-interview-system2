const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get overall system analytics
router.get('/overview', analyticsController.getSystemOverview);

// Get interview analytics
router.get('/interviews', analyticsController.getInterviewAnalytics);

// Get candidate analytics
router.get('/candidates', analyticsController.getCandidateAnalytics);

// Get performance metrics
router.get('/performance', analyticsController.getPerformanceMetrics);

// Get trend analysis
router.get('/trends', analyticsController.getTrendAnalysis);

// Export analytics data
router.get('/export', analyticsController.exportAnalyticsData);

module.exports = router;