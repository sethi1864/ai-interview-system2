const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Enhanced interview questions and responses
const interviewQuestions = [
  {
    id: 1,
    question: "Hello! I'm Sarah from HR. Tell me about yourself and what interests you about this position?",
    followUp: "That's interesting! Can you give me a specific example of your experience?",
    keywords: ["experience", "background", "skills"]
  },
  {
    id: 2,
    question: "What are your greatest strengths and how do they apply to this role?",
    followUp: "How have you used these strengths in your previous work?",
    keywords: ["strengths", "skills", "abilities"]
  },
  {
    id: 3,
    question: "Tell me about a challenging project you worked on. What was your role and how did you handle it?",
    followUp: "What did you learn from that experience?",
    keywords: ["project", "challenge", "leadership"]
  },
  {
    id: 4,
    question: "Where do you see yourself in 5 years?",
    followUp: "How does this position align with your career goals?",
    keywords: ["goals", "future", "career"]
  },
  {
    id: 5,
    question: "Why should we hire you for this position?",
    followUp: "What unique value can you bring to our team?",
    keywords: ["value", "contribution", "unique"]
  }
];

// In-memory storage for interviews
const interviews = new Map();
const activeConnections = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    activeInterviews: interviews.size,
    activeConnections: activeConnections.size
  });
});

// Start interview
app.post('/api/interview/start', (req, res) => {
  const interviewId = uuidv4();
  const currentQuestion = interviewQuestions[0];
  
  const interview = {
    id: interviewId,
    currentQuestionIndex: 0,
    history: [{ 
      type: 'ai', 
      content: currentQuestion.question,
      questionId: currentQuestion.id,
      timestamp: new Date().toISOString()
    }],
    score: 0,
    startTime: new Date().toISOString(),
    status: 'active'
  };
  
  interviews.set(interviewId, interview);
  
  res.json({
    success: true,
    interviewId: interviewId,
    openingQuestion: currentQuestion.question,
    questionId: currentQuestion.id
  });
});

// Respond to interview
app.post('/api/interview/respond', (req, res) => {
  const { interviewId, response, audioUrl } = req.body;
  const interview = interviews.get(interviewId);
  
  if (!interview) {
    return res.status(404).json({ success: false, error: 'Interview not found' });
  }
  
  // Add candidate response
  interview.history.push({ 
    type: 'candidate', 
    content: response,
    audioUrl: audioUrl,
    timestamp: new Date().toISOString()
  });
  
  // Calculate score based on response
  const score = calculateScore(response, interview.currentQuestionIndex);
  interview.score += score;
  
  // Move to next question or end interview
  const nextQuestionIndex = interview.currentQuestionIndex + 1;
  
  if (nextQuestionIndex < interviewQuestions.length) {
    const nextQuestion = interviewQuestions[nextQuestionIndex];
    interview.currentQuestionIndex = nextQuestionIndex;
    
    interview.history.push({ 
      type: 'ai', 
      content: nextQuestion.question,
      questionId: nextQuestion.id,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      aiResponse: nextQuestion.question,
      questionId: nextQuestion.id,
      scoring: { 
        currentScore: interview.score,
        questionScore: score,
        totalQuestions: interviewQuestions.length,
        currentQuestion: nextQuestionIndex + 1
      },
      interviewStatus: 'continuing'
    });
  } else {
    // Interview completed
    interview.status = 'completed';
    interview.endTime = new Date().toISOString();
    
    const finalScore = Math.round((interview.score / interviewQuestions.length) * 10);
    
    res.json({
      success: true,
      aiResponse: "Thank you for your time! I've completed your interview. We'll review your responses and get back to you soon.",
      scoring: { 
        finalScore: finalScore,
        totalScore: interview.score,
        totalQuestions: interviewQuestions.length
      },
      interviewStatus: 'completed'
    });
  }
});

// Get interview history
app.get('/api/interview/:id', (req, res) => {
  const interview = interviews.get(req.params.id);
  if (!interview) {
    return res.status(404).json({ success: false, error: 'Interview not found' });
  }
  
  res.json({
    success: true,
    interview: interview
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-interview', (interviewId) => {
    socket.join(interviewId);
    activeConnections.set(socket.id, interviewId);
    console.log(`Client ${socket.id} joined interview ${interviewId}`);
  });
  
  socket.on('video-stream', (data) => {
    socket.to(data.interviewId).emit('candidate-video', {
      stream: data.stream,
      candidateId: socket.id
    });
  });
  
  socket.on('audio-stream', (data) => {
    socket.to(data.interviewId).emit('candidate-audio', {
      stream: data.stream,
      candidateId: socket.id
    });
  });
  
  socket.on('avatar-speech', (data) => {
    socket.to(data.interviewId).emit('ai-speaking', {
      text: data.text,
      emotion: data.emotion || 'neutral'
    });
  });
  
  socket.on('disconnect', () => {
    const interviewId = activeConnections.get(socket.id);
    if (interviewId) {
      activeConnections.delete(socket.id);
      console.log(`Client ${socket.id} disconnected from interview ${interviewId}`);
    }
  });
});

// Helper function to calculate response score
function calculateScore(response, questionIndex) {
  const question = interviewQuestions[questionIndex];
  let score = 5; // Base score
  
  // Length bonus
  if (response.length > 50) score += 1;
  if (response.length > 100) score += 1;
  
  // Keyword matching
  const responseLower = response.toLowerCase();
  question.keywords.forEach(keyword => {
    if (responseLower.includes(keyword)) {
      score += 1;
    }
  });
  
  // Professional language bonus
  const professionalWords = ['experience', 'project', 'team', 'leadership', 'skills', 'goals', 'achievement'];
  professionalWords.forEach(word => {
    if (responseLower.includes(word)) {
      score += 0.5;
    }
  });
  
  return Math.min(score, 10);
}

// Serve the main HTML page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(port, () => {
  console.log('🚀 AI Interview System with Video Conferencing running on port ' + port);
  console.log('📹 Video Avatar System: ACTIVE');
  console.log('🎤 Speech Recognition: ENABLED');
  console.log('🔊 Text-to-Speech: ENABLED');
});
