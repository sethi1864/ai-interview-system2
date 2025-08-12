# 🚀 Complete AI Interview System - Cursor Prompt

Build a production-ready AI Interview System with the following specifications:

## PROJECT OVERVIEW
Create a sophisticated AI-powered interview platform where an AI avatar conducts job interviews that are indistinguishable from human interviewers. The system should handle everything from initial greeting to final evaluation, with real-time interaction and scoring.

## CORE REQUIREMENTS

### 1. TECH STACK
- **Backend**: Node.js + Express.js
- **Frontend**: React 18 with Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io for WebSocket connections
- **Deployment**: Optimized for Railway/Vercel
- **APIs**: Integration-ready for OpenAI, ElevenLabs, Deepgram, HeyGen

### 2. PROJECT STRUCTURE
```
/ai-interview-system
├── /client (React frontend)
│   ├── /src
│   │   ├── /components
│   │   │   ├── InterviewRoom.jsx
│   │   │   ├── AvatarDisplay.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── ScoreDisplay.jsx
│   │   │   ├── SessionStats.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── /hooks
│   │   │   ├── useInterview.js
│   │   │   ├── useWebSocket.js
│   │   │   └── useAudio.js
│   │   ├── /services
│   │   │   ├── apiService.js
│   │   │   ├── socketService.js
│   │   │   └── audioService.js
│   │   ├── /utils
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   └── App.jsx
├── /server
│   ├── /routes
│   │   ├── interviewRoutes.js
│   │   ├── avatarRoutes.js
│   │   ├── speechRoutes.js
│   │   └── analyticsRoutes.js
│   ├── /controllers
│   │   ├── interviewController.js
│   │   ├── avatarController.js
│   │   ├── speechController.js
│   │   └── analyticsController.js
│   ├── /models
│   │   ├── Interview.js
│   │   ├── Candidate.js
│   │   └── QuestionBank.js
│   ├── /services
│   │   ├── aiService.js
│   │   ├── avatarService.js
│   │   ├── speechService.js
│   │   ├── scoringService.js
│   │   └── socketService.js
│   ├── /middleware
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   └── server.js
├── /config
│   ├── database.js
│   └── socket.js
├── package.json
├── .env.example
└── README.md
```

### 3. BACKEND FEATURES

#### API Endpoints Required:
```javascript
// Core Interview Endpoints
POST /api/interview/start - Initialize interview session
POST /api/interview/respond - Process candidate response
GET /api/interview/:id - Get interview details
POST /api/interview/end - Finalize interview
GET /api/interview/active - List active interviews

// Avatar & Voice Endpoints
POST /api/avatar/generate - Generate avatar video
POST /api/speech/synthesize - Convert text to speech
POST /api/speech/recognize - Convert speech to text

// Analytics & Admin
GET /api/analytics/:interviewId - Get interview analytics
GET /api/admin/dashboard - Admin dashboard data
POST /api/admin/intervene - Admin intervention

// WebSocket
/ws - Real-time communication
```

#### Database Schemas (MongoDB):
```javascript
// Interview Schema
{
  interviewId: String (unique),
  candidateInfo: {
    name: String,
    email: String,
    phone: String,
    position: String,
    experience: String
  },
  status: enum ['active', 'completed', 'abandoned'],
  startTime: Date,
  endTime: Date,
  duration: Number,
  conversationHistory: [{
    speaker: String, // 'ai' or 'candidate'
    message: String,
    timestamp: Date,
    audioUrl: String,
    videoUrl: String
  }],
  scores: [{
    category: String,
    score: Number,
    feedback: String,
    timestamp: Date
  }],
  finalScore: Number,
  topics: [String],
  recommendations: String,
  aiPersona: String, // interviewer name/type
  metadata: {
    deviceInfo: Object,
    location: String,
    sessionQuality: Number
  }
}

// Candidate Schema
{
  email: String (unique),
  name: String,
  phone: String,
  resume: String,
  interviewHistory: [{
    interviewId: String,
    date: Date,
    score: Number,
    position: String
  }],
  overallRating: Number,
  tags: [String]
}

// Question Bank Schema
{
  category: String, // 'introduction', 'technical', 'behavioral', 'situational'
  questions: [{
    question: String,
    followUps: [String],
    keywords: [String],
    expectedResponse: String,
    scoringCriteria: Object
  }],
  dynamicRules: Object
}
```

### 4. FRONTEND REQUIREMENTS

#### Main Components:

**Landing Page**
- "Start Interview" button with loading states
- System status indicator (green/red)
- Demo mode option
- Interview type selection
- Candidate info form

**Interview Room Interface**
- Avatar video display (70% of screen, responsive)
- Text chat backup interface (collapsible)
- Voice input button with visual feedback
- Real-time transcription display
- Session timer with pause/resume
- "End Interview" button with confirmation
- Connection quality indicator

**Real-time Features**
- Live avatar lip-sync with audio
- Typing indicators for AI responses
- Connection status with auto-reconnect
- Audio level visualization
- Network quality indicator
- Smooth transitions between states

**Post-Interview Dashboard**
- Complete transcript with timestamps
- Score breakdown by category (visual charts)
- AI recommendations with actionable insights
- Download report option (PDF/CSV)
- Share results functionality

### 5. AI INTEGRATION ARCHITECTURE

```javascript
// AI Service Configuration
const aiConfig = {
  openai: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: `You are Sarah, an experienced HR interviewer with 8 years of experience. 
                   Conduct natural, professional interviews with intelligent follow-up questions.
                   Be friendly but maintain professional boundaries.
                   NEVER reveal you're an AI - always act as a real human interviewer.
                   Ask specific, relevant questions based on candidate responses.
                   Show genuine interest and engagement.
                   Use natural speech patterns with occasional "um", "well", "you know".
                   Keep responses conversational and human-like.`
  },
  elevenLabs: {
    voiceId: 'professional-female-sarah',
    stability: 0.75,
    similarity: 0.85,
    style: 0.35,
    useSpeakerBoost: true
  },
  deepgram: {
    model: 'nova-2',
    language: 'en',
    punctuate: true,
    diarize: true,
    smartFormat: true
  },
  heyGen: {
    avatarId: 'sarah-professional-hr',
    quality: 'high',
    emotions: true,
    gestures: true,
    background: 'office-environment'
  }
};
```

### 6. INTELLIGENT CONVERSATION FLOW

Implement dynamic questioning logic:

```javascript
// Conversation Flow Logic
const conversationFlow = {
  // Analyze candidate responses for keywords
  analyzeResponse: (response) => {
    const keywords = extractKeywords(response);
    const sentiment = analyzeSentiment(response);
    const length = response.length;
    const specificity = calculateSpecificity(response);
    
    return { keywords, sentiment, length, specificity };
  },
  
  // Generate contextual follow-up questions
  generateFollowUp: (analysis, conversationHistory) => {
    if (analysis.length < 30) {
      return "Could you elaborate more on that? I'd love to hear more details.";
    }
    if (analysis.keywords.includes('challenge')) {
      return "That sounds challenging. How did you overcome it?";
    }
    if (analysis.keywords.includes('achievement')) {
      return "That's impressive! What was your specific role in that success?";
    }
    if (analysis.specificity < 0.6) {
      return "Can you give me a specific example of that?";
    }
    
    return generateContextualQuestion(analysis, conversationHistory);
  },
  
  // Maintain conversation memory
  memory: {
    topicsCovered: [],
    candidateStrengths: [],
    areasOfConcern: [],
    followUpNeeded: []
  }
};
```

### 7. SCORING ALGORITHM

```javascript
const scoringAlgorithm = {
  factors: {
    responseLength: { weight: 0.20, optimal: { min: 50, max: 150 } },
    keywordRelevance: { weight: 0.25, keywords: ['experience', 'skills', 'achievement'] },
    specificExamples: { weight: 0.20, required: true },
    communicationClarity: { weight: 0.15, factors: ['structure', 'vocabulary', 'confidence'] },
    technicalAccuracy: { weight: 0.10, domainSpecific: true },
    enthusiasmIndicators: { weight: 0.10, indicators: ['passion', 'energy', 'engagement'] }
  },
  
  calculateScore: (response, category) => {
    let score = 0;
    
    // Response length scoring
    const lengthScore = calculateLengthScore(response.length);
    score += lengthScore * scoringAlgorithm.factors.responseLength.weight;
    
    // Keyword relevance
    const keywordScore = calculateKeywordScore(response, category);
    score += keywordScore * scoringAlgorithm.factors.keywordRelevance.weight;
    
    // Continue for all factors...
    
    return Math.min(10, Math.max(1, score));
  }
};
```

### 8. AVATAR & VOICE SYSTEM

**Photorealistic Avatar Requirements:**
- Human-like appearance (not cartoon)
- Natural expressions (blinking every 3-5 seconds)
- Lip-sync with audio (frame-perfect)
- Gesture animations (nodding, thinking pose, hand gestures)
- Multiple avatar options (Sarah, John, Priya, David)
- Background: Professional office environment
- Lighting: Natural, professional
- Resolution: 1080p minimum

**Voice System:**
- Natural speech patterns with "um", "well", "you know"
- Voice modulation for emphasis
- Appropriate pauses for thinking
- Professional tone with warmth
- Multiple voice options per avatar
- Real-time voice synthesis

### 9. ERROR HANDLING & FALLBACKS

```javascript
const errorHandling = {
  connectionLoss: {
    autoReconnect: true,
    maxRetries: 5,
    fallbackToText: true,
    saveProgress: true
  },
  apiFailure: {
    cachedResponses: true,
    gracefulDegradation: true,
    userNotification: true
  },
  avatarFailure: {
    fallbackToStaticImage: true,
    textOnlyMode: true,
    audioOnlyMode: true
  }
};
```

### 10. PRODUCTION OPTIMIZATIONS

- Redis for session caching
- CDN for avatar videos and static assets
- Lazy loading for components
- WebSocket connection pooling
- Response streaming for faster interaction
- Compressed audio/video transmission
- Rate limiting and DDoS protection
- Auto-scaling based on load

### 11. SECURITY REQUIREMENTS

```javascript
const securityConfig = {
  authentication: 'JWT',
  encryption: 'AES-256',
  cors: {
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true
  },
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  inputSanitization: true,
  sqlInjectionPrevention: true,
  secureWebSocket: true
};
```

### 12. ADMIN FEATURES

**Admin Dashboard:**
- Live interview monitoring (real-time)
- Intervention capability (join/observe interviews)
- Question bank management
- Analytics dashboard with charts
- System health metrics
- API usage tracking
- Billing/usage reports
- User management

### 13. DEMO MODE

Include fully functional demo mode:
- Pre-recorded avatar videos
- Scripted responses with branching
- Simulated scoring
- Sample conversation flows
- Test with dummy data
- No API keys required

### 14. DEPLOYMENT CONFIGURATION

```yaml
# Docker configuration
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis
  
  mongodb:
    image: mongo:latest
    volumes:
      - mongo_data:/data/db
  
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
```

### 15. RESPONSIVE DESIGN

- Mobile-first approach
- Works on all devices (desktop, tablet, mobile)
- Touch-friendly interface
- Adaptive video quality based on connection
- Offline capability for reviewing completed interviews

## IMPLEMENTATION PRIORITIES

1. **First**: Get basic conversation flow working with text
2. **Second**: Add real-time WebSocket communication
3. **Third**: Integrate OpenAI for intelligent responses
4. **Fourth**: Add avatar video display
5. **Fifth**: Implement voice input/output
6. **Finally**: Polish UI/UX and add analytics

## SAMPLE CONVERSATION FLOW

```
AI: "Hello! I'm Sarah from the HR team. Thank you for joining us today. Before we begin, could you please introduce yourself and tell me what interested you about this position?"

Candidate: [Responds]

AI: [Analyzes response, generates follow-up]
"That's really interesting! I see you mentioned [specific point]. Can you tell me more about your experience with that? What challenges did you face?"

[Continue with dynamic questioning based on responses]

AI: "Thank you for your time today. You've shared some great insights about your experience. We'll review your interview and get back to you within 2-3 business days. Do you have any questions for me about the role or our company?"
```

## SUCCESS CRITERIA

- System handles 100+ concurrent interviews
- Average response time < 2 seconds
- Candidate satisfaction score > 4.5/5
- 80% cost reduction vs human interviews
- Zero downtime during business hours
- Indistinguishable from human interviewer
- 95% deception rate (candidates don't realize it's AI)

## ENVIRONMENT VARIABLES

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai-interview
REDIS_URL=redis://localhost:6379

# AI APIs
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
DEEPGRAM_API_KEY=your_deepgram_key
HEYGEN_API_KEY=your_heygen_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## GENERATE COMPLETE CODE

Create all files with production-ready code, proper error handling, comprehensive comments, and README with setup instructions. Include example .env file with all required variables. Make it deployable immediately to Railway/Vercel.

**IMPORTANT**: The AI avatar should appear so human-like that candidates cannot tell they're talking to an AI. This is the KEY differentiator that sets this system apart from competitors.

---

## 💡 **How to Use This Prompt in Cursor:**

1. **Open Cursor Editor**
2. **Create a new project folder**
3. **Press Cmd+K (Mac) or Ctrl+K (Windows)**
4. **Paste this entire prompt**
5. **Add at the end**: "Generate the complete implementation with all files"
6. **Let Cursor generate the entire codebase**

### **Additional Cursor Commands to Use After:**

```bash
# After initial generation, you can ask:
"Add more realistic avatar expressions and gestures"
"Implement advanced scoring algorithm with ML"
"Add more interview question variations"
"Optimize for production deployment"
"Add comprehensive error handling"
"Create unit tests for all components"
"Add multilingual support"
"Implement advanced analytics dashboard"
"Add real-time admin monitoring"
"Create mobile-responsive design"
```