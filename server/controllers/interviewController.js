const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const aiService = require('../services/aiService');
const avatarService = require('../services/avatarService');
const speechService = require('../services/speechService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class InterviewController {
  // Start a new interview
  async startInterview(req, res) {
    try {
      const { candidateInfo, interviewType = 'mixed', avatarId = null } = req.body;

      // Generate unique interview ID
      const interviewId = uuidv4();

      // Create new interview record
      const interview = new Interview({
        interviewId,
        candidateInfo,
        status: 'active',
        startTime: new Date(),
        aiPersona: avatarId || 'sarah-professional-hr',
        settings: {
          interviewType,
          duration: 30, // 30 minutes default
          language: 'en',
          difficulty: 'medium'
        },
        metadata: {
          deviceInfo: {
            userAgent: req.get('User-Agent'),
            platform: req.get('Sec-Ch-Ua-Platform'),
            browser: req.get('Sec-Ch-Ua')
          },
          location: {
            country: req.get('CF-IPCountry') || 'Unknown',
            timezone: req.get('X-Timezone') || 'UTC'
          },
          sessionQuality: 100
        }
      });

      await interview.save();

      // Create or update candidate record
      await this.updateCandidateRecord(candidateInfo, interviewId);

      // Generate welcome message
      const welcomeMessage = await aiService.generateWelcomeMessage(candidateInfo);
      const audioUrl = await speechService.synthesizeSpeech(welcomeMessage);
      const avatarVideo = await avatarService.generateAvatarVideo(welcomeMessage, audioUrl, avatarId);

      // Add welcome message to conversation history
      await interview.addMessage('ai', welcomeMessage, {
        audioUrl,
        videoUrl: avatarVideo
      });

      logger.interview(`Started new interview ${interviewId} for ${candidateInfo.name}`);

      res.status(201).json({
        success: true,
        data: {
          interviewId,
          welcomeMessage,
          audioUrl,
          avatarVideo,
          avatarConfig: avatarService.getAvatarConfig(avatarId),
          estimatedDuration: interview.settings.duration
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'startInterview', body: req.body });
      res.status(500).json({
        success: false,
        error: 'Failed to start interview',
        message: error.message
      });
    }
  }

  // Process candidate response
  async processResponse(req, res) {
    try {
      const { interviewId, message, audioBlob, timestamp } = req.body;

      // Find the interview
      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      if (interview.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Interview is not active'
        });
      }

      // Save candidate response
      const audioUrl = audioBlob ? await speechService.saveAudio(audioBlob) : null;
      await interview.addMessage('candidate', message, {
        audioUrl,
        timestamp: new Date(timestamp)
      });

      // Generate AI response
      const aiResponse = await aiService.generateResponse(message, interviewId);
      const aiAudioUrl = await speechService.synthesizeSpeech(aiResponse);
      const avatarVideo = await avatarService.generateAvatarVideo(aiResponse, aiAudioUrl, interview.aiPersona);

      // Add AI response to conversation history
      await interview.addMessage('ai', aiResponse, {
        audioUrl: aiAudioUrl,
        videoUrl: avatarVideo
      });

      // Calculate score for the response
      const score = await aiService.calculateResponseScore(message, interviewId);

      logger.interview(`Processed response for interview ${interviewId}`);

      res.json({
        success: true,
        data: {
          aiResponse,
          audioUrl: aiAudioUrl,
          avatarVideo,
          score,
          conversationLength: interview.conversationHistory.length
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'processResponse', body: req.body });
      res.status(500).json({
        success: false,
        error: 'Failed to process response',
        message: error.message
      });
    }
  }

  // Get interview details
  async getInterview(req, res) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      res.json({
        success: true,
        data: interview
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'getInterview', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to get interview',
        message: error.message
      });
    }
  }

  // End interview
  async endInterview(req, res) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      // Generate closing message
      const closingMessage = await aiService.generateClosingMessage(interviewId);
      const audioUrl = await speechService.synthesizeSpeech(closingMessage);
      const avatarVideo = await avatarService.generateAvatarVideo(closingMessage, audioUrl, interview.aiPersona);

      // Add closing message to conversation history
      await interview.addMessage('ai', closingMessage, {
        audioUrl,
        videoUrl: avatarVideo
      });

      // End the interview
      await interview.endInterview();

      // Get final score
      const finalScore = await aiService.getFinalScore(interviewId);

      // Update candidate record
      await this.updateCandidateInterviewHistory(interview.candidateInfo.email, {
        interviewId,
        date: interview.endTime,
        score: finalScore,
        position: interview.candidateInfo.position,
        status: finalScore >= 7 ? 'passed' : 'failed',
        duration: interview.duration,
        aiPersona: interview.aiPersona
      });

      logger.interview(`Ended interview ${interviewId} with score ${finalScore}`);

      res.json({
        success: true,
        data: {
          closingMessage,
          audioUrl,
          avatarVideo,
          finalScore,
          duration: interview.formattedDuration,
          totalMessages: interview.conversationHistory.length
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'endInterview', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to end interview',
        message: error.message
      });
    }
  }

  // Get active interviews
  async getActiveInterviews(req, res) {
    try {
      const activeInterviews = await Interview.find({ status: 'active' })
        .select('interviewId candidateInfo startTime aiPersona settings')
        .sort({ startTime: -1 })
        .limit(50);

      res.json({
        success: true,
        data: activeInterviews
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'getActiveInterviews' });
      res.status(500).json({
        success: false,
        error: 'Failed to get active interviews',
        message: error.message
      });
    }
  }

  // Get interview statistics
  async getInterviewStats(req, res) {
    try {
      const stats = await Interview.getStats();
      const candidateStats = await Candidate.getStats();

      res.json({
        success: true,
        data: {
          interviews: stats,
          candidates: candidateStats,
          systemHealth: {
            aiService: 'healthy',
            avatarService: 'healthy',
            speechService: 'healthy'
          }
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'getInterviewStats' });
      res.status(500).json({
        success: false,
        error: 'Failed to get interview statistics',
        message: error.message
      });
    }
  }

  // Get interview analytics
  async getInterviewAnalytics(req, res) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      // Calculate analytics
      const analytics = {
        duration: interview.formattedDuration,
        totalMessages: interview.conversationHistory.length,
        aiMessages: interview.conversationHistory.filter(msg => msg.speaker === 'ai').length,
        candidateMessages: interview.conversationHistory.filter(msg => msg.speaker === 'candidate').length,
        averageResponseLength: this.calculateAverageResponseLength(interview.conversationHistory),
        topicsCovered: this.extractTopics(interview.conversationHistory),
        sentimentAnalysis: this.analyzeSentiment(interview.conversationHistory),
        scoreBreakdown: this.getScoreBreakdown(interview.scores),
        finalScore: interview.finalScore,
        recommendations: interview.recommendations
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'getInterviewAnalytics', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to get interview analytics',
        message: error.message
      });
    }
  }

  // Resume interview
  async resumeInterview(req, res) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      if (interview.status !== 'paused') {
        return res.status(400).json({
          success: false,
          error: 'Interview is not paused'
        });
      }

      interview.status = 'active';
      await interview.save();

      logger.interview(`Resumed interview ${interviewId}`);

      res.json({
        success: true,
        data: {
          status: 'active',
          message: 'Interview resumed successfully'
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'resumeInterview', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to resume interview',
        message: error.message
      });
    }
  }

  // Pause interview
  async pauseInterview(req, res) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      if (interview.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Interview is not active'
        });
      }

      interview.status = 'paused';
      await interview.save();

      logger.interview(`Paused interview ${interviewId}`);

      res.json({
        success: true,
        data: {
          status: 'paused',
          message: 'Interview paused successfully'
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'pauseInterview', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to pause interview',
        message: error.message
      });
    }
  }

  // Get interview transcript
  async getInterviewTranscript(req, res) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      const transcript = interview.conversationHistory.map(msg => ({
        speaker: msg.speaker,
        message: msg.message,
        timestamp: msg.timestamp,
        audioUrl: msg.audioUrl
      }));

      res.json({
        success: true,
        data: {
          interviewId,
          candidateInfo: interview.candidateInfo,
          transcript,
          duration: interview.formattedDuration,
          finalScore: interview.finalScore
        }
      });

    } catch (error) {
      logger.errorWithContext(error, { method: 'getInterviewTranscript', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to get interview transcript',
        message: error.message
      });
    }
  }

  // Export interview data
  async exportInterviewData(req, res) {
    try {
      const { interviewId } = req.params;
      const { format = 'json' } = req.query;

      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        return res.status(404).json({
          success: false,
          error: 'Interview not found'
        });
      }

      if (format === 'csv') {
        // Generate CSV format
        const csvData = this.generateCSV(interview);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=interview-${interviewId}.csv`);
        res.send(csvData);
      } else {
        // Default JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=interview-${interviewId}.json`);
        res.json(interview);
      }

    } catch (error) {
      logger.errorWithContext(error, { method: 'exportInterviewData', params: req.params });
      res.status(500).json({
        success: false,
        error: 'Failed to export interview data',
        message: error.message
      });
    }
  }

  // Helper methods
  async updateCandidateRecord(candidateInfo, interviewId) {
    try {
      let candidate = await Candidate.findOne({ email: candidateInfo.email });
      
      if (!candidate) {
        candidate = new Candidate({
          email: candidateInfo.email,
          name: candidateInfo.name,
          phone: candidateInfo.phone,
          resume: candidateInfo.resume
        });
      }

      await candidate.save();
    } catch (error) {
      logger.errorWithContext(error, { method: 'updateCandidateRecord', candidateInfo });
    }
  }

  async updateCandidateInterviewHistory(email, interviewData) {
    try {
      await Candidate.findOneAndUpdate(
        { email },
        { $push: { interviewHistory: interviewData } }
      );
    } catch (error) {
      logger.errorWithContext(error, { method: 'updateCandidateInterviewHistory', email });
    }
  }

  calculateAverageResponseLength(conversationHistory) {
    const candidateMessages = conversationHistory.filter(msg => msg.speaker === 'candidate');
    if (candidateMessages.length === 0) return 0;
    
    const totalLength = candidateMessages.reduce((sum, msg) => sum + msg.message.length, 0);
    return Math.round(totalLength / candidateMessages.length);
  }

  extractTopics(conversationHistory) {
    const topics = new Set();
    conversationHistory.forEach(msg => {
      const words = msg.message.toLowerCase().split(/\s+/);
      const topicKeywords = ['javascript', 'react', 'node', 'python', 'aws', 'docker', 'agile', 'team', 'leadership'];
      
      topicKeywords.forEach(keyword => {
        if (words.some(word => word.includes(keyword))) {
          topics.add(keyword);
        }
      });
    });
    
    return Array.from(topics);
  }

  analyzeSentiment(conversationHistory) {
    const candidateMessages = conversationHistory.filter(msg => msg.speaker === 'candidate');
    const sentiments = candidateMessages.map(msg => msg.metadata?.sentiment || 'neutral');
    
    const sentimentCounts = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    return sentimentCounts;
  }

  getScoreBreakdown(scores) {
    const breakdown = {};
    scores.forEach(score => {
      if (!breakdown[score.category]) {
        breakdown[score.category] = [];
      }
      breakdown[score.category].push(score);
    });
    
    return breakdown;
  }

  generateCSV(interview) {
    const headers = ['Speaker', 'Message', 'Timestamp', 'Score'];
    const rows = interview.conversationHistory.map(msg => [
      msg.speaker,
      msg.message,
      msg.timestamp,
      msg.metadata?.score || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

module.exports = new InterviewController();