const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// Apply authentication to all admin routes
router.use(authenticateAdmin);

// Admin dashboard data
router.get('/dashboard', adminController.getDashboardData);

// Live interview monitoring
router.get('/interviews/live', adminController.getLiveInterviews);

// Admin intervention in interview
router.post('/interviews/:interviewId/intervene', adminController.interveneInInterview);

// System health monitoring
router.get('/health', adminController.getSystemHealth);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Question bank management
router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:questionId', adminController.updateQuestion);
router.delete('/questions/:questionId', adminController.deleteQuestion);

// System settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// API usage tracking
router.get('/api-usage', adminController.getApiUsage);

// Billing and usage reports
router.get('/billing', adminController.getBillingInfo);

module.exports = router;