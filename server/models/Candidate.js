const mongoose = require('mongoose');

const interviewHistorySchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    min: 1,
    max: 10
  },
  position: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'pending', 'withdrawn'],
    default: 'pending'
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  duration: Number, // in minutes
  aiPersona: String
});

const candidateSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  resume: {
    type: String,
    default: null
  },
  interviewHistory: [interviewHistorySchema],
  overallRating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    preferredPositions: [String],
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    location: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote'
    },
    noticePeriod: Number // in days
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  },
  metadata: {
    source: {
      type: String,
      enum: ['direct', 'referral', 'job-board', 'agency', 'social-media', 'other'],
      default: 'direct'
    },
    lastContact: Date,
    notes: String,
    linkedinProfile: String,
    portfolio: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
candidateSchema.index({ email: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ 'interviewHistory.date': -1 });
candidateSchema.index({ overallRating: -1 });

// Virtual for total interviews
candidateSchema.virtual('totalInterviews').get(function() {
  return this.interviewHistory.length;
});

// Virtual for average score
candidateSchema.virtual('averageScore').get(function() {
  if (!this.interviewHistory || this.interviewHistory.length === 0) return null;
  const scores = this.interviewHistory.filter(h => h.score).map(h => h.score);
  if (scores.length === 0) return null;
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round((total / scores.length) * 10) / 10;
});

// Virtual for last interview date
candidateSchema.virtual('lastInterviewDate').get(function() {
  if (!this.interviewHistory || this.interviewHistory.length === 0) return null;
  const sorted = this.interviewHistory.sort((a, b) => b.date - a.date);
  return sorted[0].date;
});

// Pre-save middleware to update overall rating
candidateSchema.pre('save', function(next) {
  if (this.interviewHistory && this.interviewHistory.length > 0) {
    const scores = this.interviewHistory.filter(h => h.score).map(h => h.score);
    if (scores.length > 0) {
      const total = scores.reduce((sum, score) => sum + score, 0);
      this.overallRating = Math.round((total / scores.length) * 10) / 10;
    }
  }
  next();
});

// Static method to get candidate statistics
candidateSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCandidates: { $sum: 1 },
        activeCandidates: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        averageRating: { $avg: '$overallRating' },
        averageInterviews: { $avg: { $size: '$interviewHistory' } }
      }
    }
  ]);
  
  return stats[0] || {
    totalCandidates: 0,
    activeCandidates: 0,
    averageRating: 0,
    averageInterviews: 0
  };
};

// Instance method to add interview history
candidateSchema.methods.addInterview = function(interviewData) {
  this.interviewHistory.push({
    interviewId: interviewData.interviewId,
    date: interviewData.date || new Date(),
    score: interviewData.score,
    position: interviewData.position,
    status: interviewData.status || 'pending',
    feedback: interviewData.feedback,
    duration: interviewData.duration,
    aiPersona: interviewData.aiPersona
  });
  
  return this.save();
};

// Instance method to update status
candidateSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

// Instance method to add skill
candidateSchema.methods.addSkill = function(skillName, level = 'intermediate', verified = false) {
  const existingSkill = this.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
  
  if (existingSkill) {
    existingSkill.level = level;
    existingSkill.verified = verified;
  } else {
    this.skills.push({
      name: skillName,
      level,
      verified
    });
  }
  
  return this.save();
};

// Instance method to add tag
candidateSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

module.exports = mongoose.model('Candidate', candidateSchema);