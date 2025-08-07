const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Ensure directories exist
['uploads', 'public'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
});

// AI Interview Service
class AIInterviewService {
  constructor() {
    this.activeInterviews = new Map();
    this.questionBank = {
      introduction: [
        "Hello! Thank you for joining us today. I'm Sarah from HR. Could you please start by telling me about yourself and what interests you about this position?",
        "That's wonderful! Can you tell me more about your background and experience?",
        "What specifically drew you to apply for this role?"
      ],
      technical: [
        "Can you walk me through your approach to solving complex problems?",
        "Tell me about a challenging project you've worked on recently.",
        "How do you stay current with new technologies?",
        "Describe your experience with relevant technologies."
      ],
      behavioral: [
        "Tell me about a time when you had to work under tight deadlines.",
        "How do you handle conflicts within your team?",
        "Give me an example of when you had to learn something new quickly.",
        "Tell me about a time when you went above and beyond."
      ],
      closing: [
        "Do you have any questions about the role or company?",
        "Is there anything else you'd like to share?",
        "Thank you for your time today!"
      ]
    };
  }

  async generateResponse(conversationHistory, candidateResponse, interviewType = 'general') {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const context = this.analyzeContext(conversationHistory, candidateResponse);
    const questionCategory = this.selectQuestionCategory(context, interviewType);
    const response = this.selectIntelligentQuestion(questionCategory, candidateResponse, context);
    
    return {
      question: response.question,
      followUp: true,
      score: this.evaluateResponse(candidateResponse),
      topics: this.extractTopics(candidateResponse),
      category: questionCategory
    };
  }

  analyzeContext(history, response) {
    const questionCount = history.filter(h => h.type === 'ai').length;
    return {
      questionCount,
      isEarlyStage: questionCount < 3,
      isMidStage: questionCount >= 3 && questionCount < 8,
      isLateStage: questionCount >= 8,
      responseLength: response.length
    };
  }

  selectQuestionCategory(context, interviewType) {
    if (context.questionCount === 0) return 'introduction';
    if (context.questionCount >= 8) return 'closing';
    
    const categories = ['technical', 'behavioral'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  selectIntelligentQuestion(category, candidateResponse, context) {
    const questions = this.questionBank[category] || this.questionBank.behavioral;
    let selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    if (candidateResponse && Math.random() > 0.5) {
      const followUps = [
        "That's interesting! Can you give me a specific example?",
        "How did that experience shape your approach?",
        "What would you do differently in a similar situation?",
        "Can you elaborate on that?"
      ];
      selectedQuestion = followUps[Math.floor(Math.random() * followUps.length)];
    }
    
    return { question: selectedQuestion };
  }

  evaluateResponse(response) {
    let score = 5;
    if (response.length < 30) score -= 2;
    else if (response.length > 100) score += 1;
    
    const qualityWords = ['example', 'experience', 'project', 'team', 'challenge'];
    qualityWords.forEach(word => {
      if (response.toLowerCase().includes(word)) score += 0.5;
    });
    
    return Math.min(Math.max(Math.round(score * 10) / 10, 1), 10);
  }

  extractTopics(response) {
    const topicMap = {
      'leadership': ['lead', 'manage', 'supervisor'],
      'teamwork': ['team', 'collaborate', 'together'],
      'technical': ['code', 'software', 'technology'],
      'communication': ['present', 'explain', 'discuss']
    };
    
    const topics = [];
    const lowerResponse = response.toLowerCase();
    
    Object.entries(topicMap).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerResponse.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }
}

const aiService = new AIInterviewService();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeInterviews: aiService.activeInterviews.size
  });
});

app.post('/api/interview/start', async (req, res) => {
  try {
    const { candidateId, candidateName, jobRole = 'General Position', interviewType = 'general' } = req.body;
    
    const interviewId = `interview_${Date.now()}_${candidateId || 'demo'}`;
    
    const interviewSession = {
      id: interviewId,
      candidateId: candidateId || 'demo',
      candidateName: candidateName || 'Demo User',
      jobRole,
      interviewType,
      startTime: new Date(),
      conversationHistory: [],
      scores: [],
      status: 'active'
    };

    const openingQuestion = aiService.questionBank.introduction[0];
    interviewSession.conversationHistory.push({
      type: 'ai',