const { body, validationResult } = require('express-validator');

// Validate interview start request
const validateInterviewStart = [
  body('candidateInfo.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('candidateInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  body('candidateInfo.position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
  
  body('candidateInfo.phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  
  body('interviewType')
    .optional()
    .isIn(['technical', 'behavioral', 'mixed', 'executive'])
    .withMessage('Interview type must be one of: technical, behavioral, mixed, executive'),
  
  body('avatarId')
    .optional()
    .isString()
    .withMessage('Avatar ID must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Validate interview response request
const validateInterviewResponse = [
  body('interviewId')
    .isUUID()
    .withMessage('Interview ID must be a valid UUID'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date'),
  
  body('audioBlob')
    .optional()
    .isString()
    .withMessage('Audio blob must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Validate speech synthesis request
const validateSpeechSynthesis = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Text must be between 1 and 1000 characters'),
  
  body('voiceId')
    .optional()
    .isString()
    .withMessage('Voice ID must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Validate speech recognition request
const validateSpeechRecognition = [
  body('audioBlob')
    .isString()
    .withMessage('Audio blob must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Validate avatar generation request
const validateAvatarGeneration = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Text must be between 1 and 1000 characters'),
  
  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL'),
  
  body('avatarId')
    .optional()
    .isString()
    .withMessage('Avatar ID must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Validate admin intervention request
const validateAdminIntervention = [
  body('adminMessage')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Admin message must be between 1 and 500 characters'),
  
  body('interventionType')
    .optional()
    .isIn(['join', 'observe', 'message'])
    .withMessage('Intervention type must be one of: join, observe, message'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Validate question creation request
const validateQuestionCreation = [
  body('category')
    .isIn(['introduction', 'technical', 'behavioral', 'situational'])
    .withMessage('Category must be one of: introduction, technical, behavioral, situational'),
  
  body('question')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Question must be between 10 and 500 characters'),
  
  body('followUps')
    .optional()
    .isArray()
    .withMessage('Follow-ups must be an array'),
  
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateInterviewStart,
  validateInterviewResponse,
  validateSpeechSynthesis,
  validateSpeechRecognition,
  validateAvatarGeneration,
  validateAdminIntervention,
  validateQuestionCreation
};