const mongoose = require('mongoose');

const conversationMessageSchema = new mongoose.Schema({
  speaker: {
    type: String,
    enum: ['ai', 'candidate', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  audioUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  metadata: {
    responseTime: Number,
    wordCount: Number,
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    keywords: [String],
    confidence: Number
  }
});

const scoreSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['communication', 'technical', 'behavioral', 'problem-solving', 'overall'],
    required: true
  },
  score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  factors: {
    responseLength: Number,
    keywordRelevance: Number,
    specificExamples: Number,
    communicationClarity: Number,
    technicalAccuracy: Number,
    enthusiasmIndicators: Number
  }
});

const candidateInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  position: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  resume: {
    type: String,
    default: null
  },
  source: {
    type: String,
    enum: ['direct', 'referral', 'job-board', 'agency', 'other'],
    default: 'direct'
  }
});

const metadataSchema = new mongoose.Schema({
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    screenResolution: String
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  sessionQuality: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  networkInfo: {
    connectionType: String,
    bandwidth: Number,
    latency: Number
  },
  technicalIssues: [{
    type: String,
    timestamp: Date,
    description: String,
    resolved: Boolean
  }]
});

const interviewSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  candidateInfo: {
    type: candidateInfoSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'paused'],
    default: 'active',
    index: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  conversationHistory: [conversationMessageSchema],
  scores: [scoreSchema],
  finalScore: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  topics: [{
    type: String,
    trim: true
  }],
  recommendations: {
    type: String,
    maxlength: 2000
  },
  aiPersona: {
    type: String,
    default: 'sarah-professional-hr',
    enum: ['sarah-professional-hr', 'john-technical-lead', 'priya-senior-hr', 'david-executive']
  },
  metadata: {
    type: metadataSchema,
    default: {}
  },
  flags: {
    requiresHumanReview: {
      type: Boolean,
      default: false
    },
    technicalIssues: {
      type: Boolean,
      default: false
    },
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    adminIntervention: {
      type: Boolean,
      default: false
    }
  },
  settings: {
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed', 'executive'],
      default: 'mixed'
    },
    duration: {
      type: Number, // in minutes
      default: 30
    },
    language: {
      type: String,
      default: 'en'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
interviewSchema.index({ 'candidateInfo.email': 1 });
interviewSchema.index({ status: 1, startTime: -1 });
interviewSchema.index({ 'metadata.sessionQuality': -1 });
interviewSchema.index({ finalScore: -1 });

// Virtual for formatted duration
interviewSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  const minutes = Math.floor(this.duration / 60000);
  const seconds = Math.floor((this.duration % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for average score
interviewSchema.virtual('averageScore').get(function() {
  if (!this.scores || this.scores.length === 0) return null;
  const total = this.scores.reduce((sum, score) => sum + score.score, 0);
  return Math.round((total / this.scores.length) * 10) / 10;
});

// Pre-save middleware to calculate final score
interviewSchema.pre('save', function(next) {
  if (this.scores && this.scores.length > 0) {
    const total = this.scores.reduce((sum, score) => sum + score.score, 0);
    this.finalScore = Math.round((total / this.scores.length) * 10) / 10;
  }
  
  if (this.endTime && this.startTime) {
    this.duration = this.endTime.getTime() - this.startTime.getTime();
  }
  
  next();
});

// Static method to get interview statistics
interviewSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        completedInterviews: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        activeInterviews: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        averageScore: { $avg: '$finalScore' },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
  
  return stats[0] || {
    totalInterviews: 0,
    completedInterviews: 0,
    activeInterviews: 0,
    averageScore: 0,
    averageDuration: 0
  };
};

// Instance method to add conversation message
interviewSchema.methods.addMessage = function(speaker, message, options = {}) {
  this.conversationHistory.push({
    speaker,
    message,
    timestamp: new Date(),
    audioUrl: options.audioUrl || null,
    videoUrl: options.videoUrl || null,
    metadata: options.metadata || {}
  });
  
  return this.save();
};

// Instance method to add score
interviewSchema.methods.addScore = function(category, score, feedback = '', factors = {}) {
  this.scores.push({
    category,
    score,
    feedback,
    timestamp: new Date(),
    factors
  });
  
  return this.save();
};

// Instance method to end interview
interviewSchema.methods.endInterview = function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = this.endTime.getTime() - this.startTime.getTime();
  
  return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);