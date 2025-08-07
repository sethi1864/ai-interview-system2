const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple in-memory storage
const interviews = new Map();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeInterviews: interviews.size
  });
});

app.post('/api/interview/start', (req, res) => {
  const { candidateId = 'demo', candidateName = 'Demo User', jobRole = 'Software Engineer' } = req.body;
  
  const interviewId = `interview_${Date.now()}_${candidateId}`;
  const openingQuestion = "Hello! Thank you for joining us today. I'm Sarah from HR. Could you please start by telling me about yourself and what interests you about this position?";
  
  interviews.set(interviewId, {
    id: interviewId,
    candidateName,
    jobRole,
    startTime: new Date(),
    history: [{ type: 'ai', content: openingQuesti