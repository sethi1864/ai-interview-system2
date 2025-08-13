# 🚀 AI Interview System

A revolutionary AI-powered interview platform that conducts job interviews with photorealistic avatars so naturally that candidates can't distinguish them from human interviewers.

## 🎯 Key Features

### 🤖 **AI-Powered Intelligence**
- **GPT-4 Integration**: Advanced conversation with natural follow-up questions
- **Dynamic Questioning**: Context-aware responses based on candidate answers
- **Real-time Scoring**: Intelligent evaluation of responses
- **Conversation Memory**: Maintains context throughout the interview

### 👤 **Photorealistic Avatars**
- **HeyGen Integration**: Human-like video generation with lip-sync
- **Multiple Personas**: Sarah (HR), John (Technical), Priya (Senior HR), David (Executive)
- **Natural Expressions**: Blinking, nodding, gestures, and emotions
- **Professional Backgrounds**: Office environments for authenticity

### 🎤 **Voice & Speech**
- **ElevenLabs Integration**: Natural voice synthesis with emotion
- **Deepgram Integration**: Real-time speech-to-text conversion
- **Multiple Voices**: Different voices for each avatar persona
- **Audio Processing**: High-quality audio capture and playback

### 📊 **Real-time Analytics**
- **Live Scoring**: Instant evaluation of candidate responses
- **Performance Metrics**: Communication, technical, behavioral scoring
- **Interview Analytics**: Comprehensive reporting and insights
- **Admin Dashboard**: Real-time monitoring and intervention

### 🔒 **Enterprise Security**
- **JWT Authentication**: Secure session management
- **Rate Limiting**: Protection against abuse
- **Data Encryption**: End-to-end encryption
- **Privacy Compliance**: GDPR and data protection ready

## 🏗️ Architecture

```
ai-interview-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                # Node.js Backend
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── models/          # Database models
│   ├── services/        # External API services
│   └── middleware/      # Express middleware
├── config/              # Configuration files
└── logs/               # Application logs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- Redis 6.0+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-interview-system.git
cd ai-interview-system
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys
nano .env
```

Required environment variables:
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
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Start the Application
```bash
# Development mode (both frontend and backend)
npm run dev

# Or start separately
npm run server    # Backend only
npm run client    # Frontend only
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🎭 Demo Mode

The system includes a fully functional demo mode that works without API keys:

```bash
# Enable demo mode in .env
DEMO_MODE_ENABLED=true
DEMO_API_KEYS_REQUIRED=false
```

Demo features:
- Pre-recorded avatar videos
- Scripted responses with branching
- Simulated scoring
- Sample conversation flows

## 📱 Usage

### Starting an Interview

1. **Landing Page**: Visit the homepage and click "Start Interview"
2. **Candidate Info**: Fill in name, email, position, and experience
3. **Avatar Selection**: Choose your preferred AI interviewer
4. **Interview Room**: Join the real-time interview session

### Interview Flow

1. **Welcome**: AI greets candidate with personalized message
2. **Conversation**: Natural back-and-forth with intelligent follow-ups
3. **Scoring**: Real-time evaluation of responses
4. **Closing**: Professional conclusion with next steps

### Admin Features

1. **Dashboard**: Monitor active interviews and system health
2. **Intervention**: Join interviews for human oversight
3. **Analytics**: View performance metrics and trends
4. **Management**: Manage questions, users, and settings

## 🔧 API Endpoints

### Interview Management
```bash
POST /api/interview/start          # Start new interview
POST /api/interview/respond        # Process candidate response
GET  /api/interview/:id           # Get interview details
POST /api/interview/:id/end       # End interview
GET  /api/interview/active/list   # List active interviews
```

### Avatar & Voice
```bash
POST /api/avatar/generate         # Generate avatar video
GET  /api/avatar/list            # Get available avatars
POST /api/speech/synthesize      # Text to speech
POST /api/speech/recognize       # Speech to text
```

### Analytics
```bash
GET /api/analytics/overview      # System overview
GET /api/analytics/interviews    # Interview analytics
GET /api/analytics/candidates    # Candidate analytics
```

## 🎨 Frontend Components

### Core Components
- `LandingPage`: Professional homepage with features showcase
- `InterviewRoom`: Main interview interface with avatar and chat
- `AvatarDisplay`: Video player for AI interviewer
- `ChatInterface`: Real-time conversation interface
- `ScoreDisplay`: Live scoring and feedback
- `AdminDashboard`: Administrative interface

### Hooks
- `useInterview`: Interview state management
- `useWebSocket`: Real-time communication
- `useAudio`: Audio recording and playback

## 🗄️ Database Schema

### Interview Model
```javascript
{
  interviewId: String,           // Unique identifier
  candidateInfo: {               // Candidate details
    name: String,
    email: String,
    position: String,
    experience: String
  },
  status: String,                // active, completed, abandoned
  conversationHistory: Array,    // Message history
  scores: Array,                 // Response scores
  finalScore: Number,            // Overall score
  aiPersona: String,             // Avatar type
  metadata: Object               // Session metadata
}
```

### Candidate Model
```javascript
{
  email: String,                 // Unique identifier
  name: String,
  interviewHistory: Array,       // Past interviews
  overallRating: Number,         // Average score
  skills: Array,                 // Technical skills
  preferences: Object            // Job preferences
}
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- Secure password handling

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Rate Limiting
- API rate limiting
- Request throttling
- DDoS protection
- Abuse prevention

## 📊 Performance Optimization

### Caching
- Redis for session storage
- Response caching
- Database query optimization
- CDN for static assets

### Scalability
- Horizontal scaling support
- Load balancing ready
- Database connection pooling
- Async processing

## 🧪 Testing

### Backend Tests
```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:coverage      # Coverage report
```

### Frontend Tests
```bash
cd client
npm test                   # Run React tests
npm run test:coverage      # Coverage report
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t ai-interview-system .

# Run container
docker run -p 3000:3000 ai-interview-system
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy to Railway
railway login
railway init
railway up
```

### Environment Variables for Production
```bash
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
REDIS_URL=your_production_redis_url
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=your_frontend_domain
```

## 📈 Monitoring & Logging

### Application Logs
- Winston logging with multiple transports
- Error tracking and monitoring
- Performance metrics
- Audit trails

### Health Checks
```bash
GET /health              # Application health
GET /api/health          # API health
GET /api/avatar/health   # Avatar service health
GET /api/speech/health   # Speech service health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/ai-interview-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-interview-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-interview-system/discussions)
- **Email**: support@aiinterviewpro.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic interview functionality
- ✅ Avatar integration
- ✅ Voice synthesis
- ✅ Real-time scoring

### Phase 2 (Q2 2024)
- 🔄 Multi-language support
- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 Integration APIs

### Phase 3 (Q3 2024)
- 📋 AI-powered resume parsing
- 📋 Behavioral analysis
- 📋 Predictive hiring
- 📋 Enterprise features

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 integration
- **HeyGen** for avatar generation
- **ElevenLabs** for voice synthesis
- **Deepgram** for speech recognition
- **MongoDB** for database
- **Redis** for caching

---

**Built with ❤️ by the AI Interview Pro Team**

*Revolutionizing recruitment through intelligent automation*