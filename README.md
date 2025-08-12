# 🤖 AI Interview System Pro - Video Conferencing Mode

A complete AI-powered interview system with video conferencing capabilities, featuring an animated AI avatar that conducts realistic job interviews.

## 🚀 Live Demo

**Live URL**: https://ai-interview-system2-production.up.railway.app/

## ✨ Features

### 🎥 Video Conferencing Mode
- **Real-time video streaming** with WebRTC
- **AI Avatar "Sarah"** with realistic facial animations
- **Lip-sync technology** for natural speech
- **Professional appearance** with business attire
- **Emotional expressions** (neutral, happy, serious)

### 🎤 Voice & Speech
- **Free Text-to-Speech** using Web Speech API
- **Speech Recognition** for voice input
- **Real-time voice processing**
- **Multiple voice options** (female voices preferred)

### 📊 Interview Features
- **5 Professional Questions** with follow-ups
- **Real-time scoring** based on response quality
- **Progress tracking** with visual indicators
- **Interview logs** with timestamps
- **Audio recording** of responses

### 🎨 User Interface
- **Modern, responsive design** with Tailwind-inspired CSS
- **Split-screen layout** (candidate + AI avatar)
- **Real-time status indicators**
- **Mobile-responsive** design
- **Professional color scheme**

## 🛠️ Technical Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **WebRTC** for video streaming
- **In-memory storage** for interview data

### Frontend
- **Vanilla JavaScript** with ES6+ features
- **Canvas API** for avatar rendering
- **Web Speech API** for TTS and STT
- **MediaDevices API** for camera/microphone access

### Free Alternatives Used
- **Web Speech API** (instead of ElevenLabs)
- **Canvas-based Avatar** (instead of HeyGen)
- **Browser-native TTS** (instead of OpenAI TTS)

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- Modern browser with WebRTC support
- Camera and microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-system-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🎯 How to Use

### Starting an Interview
1. Click "🎬 Start Video Interview"
2. Allow camera and microphone access
3. AI Sarah will appear and ask the first question

### During the Interview
- **Voice Input**: Click "🎤 Start Voice Input" to speak your response
- **Text Input**: Type your response in the text area
- **Camera Controls**: Toggle camera/microphone on/off
- **Progress**: Monitor your score and question progress

### Interview Flow
1. **Question 1**: Tell me about yourself
2. **Question 2**: What are your greatest strengths?
3. **Question 3**: Describe a challenging project
4. **Question 4**: Where do you see yourself in 5 years?
5. **Question 5**: Why should we hire you?

## 🎨 Avatar System

### Features
- **Realistic facial animations** with blinking and lip-sync
- **Professional appearance** with business attire
- **Emotional expressions** that change based on context
- **Smooth animations** at 60fps
- **Responsive design** that works on all devices

### Technical Implementation
- **Canvas-based rendering** for smooth animations
- **RequestAnimationFrame** for optimal performance
- **Modular design** for easy customization
- **Memory efficient** with proper cleanup

## 🔧 API Endpoints

### Health Check
```
GET /api/health
```
Returns system status and active connections.

### Start Interview
```
POST /api/interview/start
```
Creates a new interview session.

### Submit Response
```
POST /api/interview/respond
```
Submits candidate response and gets next question.

### Get Interview History
```
GET /api/interview/:id
```
Retrieves complete interview data.

## 🌐 WebSocket Events

### Client to Server
- `join-interview`: Join interview room
- `video-stream`: Send video stream
- `audio-stream`: Send audio stream
- `avatar-speech`: Trigger avatar speech

### Server to Client
- `candidate-video`: Receive candidate video
- `candidate-audio`: Receive candidate audio
- `ai-speaking`: AI avatar speaking event

## 📊 Scoring System

### Response Evaluation
- **Length bonus**: Longer responses get higher scores
- **Keyword matching**: Professional terms boost scores
- **Content quality**: Relevant experience and skills
- **Communication**: Clear and articulate responses

### Score Calculation
- Base score: 5/10
- Length bonus: +1 for >50 words, +1 for >100 words
- Keyword bonus: +1 per relevant keyword
- Professional language: +0.5 per professional term
- Maximum score: 10/10 per question

## 🎯 Free Alternatives Used

### Text-to-Speech
- **Web Speech API** (browser-native)
- **Multiple voice options** available
- **No API costs** or rate limits
- **High quality** female voices

### Speech Recognition
- **Web Speech API** (browser-native)
- **Real-time transcription**
- **Multiple language support**
- **No external dependencies**

### Avatar Generation
- **Canvas-based rendering**
- **Custom animations** and expressions
- **Professional appearance**
- **No external API costs**

## 🔒 Privacy & Security

### Data Handling
- **No permanent storage** of video/audio
- **In-memory only** interview data
- **Automatic cleanup** on session end
- **No external API calls** for sensitive data

### Browser Permissions
- **Camera access** for video streaming
- **Microphone access** for voice input
- **Local processing** of all data
- **No data transmission** to third parties

## 🚀 Deployment

### Railway.app (Current)
- **Automatic deployment** from Git
- **HTTPS enabled** by default
- **WebSocket support** included
- **Environment variables** configured

### Local Development
- **Hot reload** with nodemon
- **Debug mode** available
- **Local SSL** for testing
- **Port configuration** via environment

## 🎨 Customization

### Avatar Appearance
- Modify `avatar.js` for different looks
- Change colors, hairstyles, and attire
- Add new emotional expressions
- Customize animation timing

### Interview Questions
- Edit `interviewQuestions` array in `server.js`
- Add new question categories
- Modify scoring algorithms
- Customize follow-up responses

### UI Styling
- Update CSS in `index.html`
- Change color schemes
- Modify layout and spacing
- Add new UI components

## 🔮 Future Enhancements

### Planned Features
- **Multiple avatar options** (different interviewers)
- **Advanced scoring algorithms** with AI
- **Interview recording** and playback
- **Candidate dashboard** with analytics
- **Integration with HR systems**

### Technical Improvements
- **Database integration** for persistent storage
- **Advanced avatar animations** with 3D
- **Multi-language support** for international use
- **Mobile app** development
- **AI-powered question generation**

## 📞 Support

### Issues & Bugs
- Check browser console for errors
- Ensure camera/microphone permissions
- Verify WebRTC support in browser
- Test with different browsers

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Limited Web Speech API
- **Edge**: Full support

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Built with ❤️ for modern AI-powered interviews**