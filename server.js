const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const interviews = new Map();

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', activeInterviews: interviews.size });
});

app.post('/api/interview/start', (req, res) => {
  const { candidateId = 'demo', candidateName = 'Demo User' } = req.body;
  const id = 'interview_' + Date.now() + '_' + candidateId;
  const question = "Hello! Thank you for joining us today. I'm Sarah from HR. Could you please start by telling me about yourself and what interests you about this position?";
  
  interviews.set(id, {
    id,
    candidateName,
    startTime: new Date(),
    history: [{ type: 'ai', content: question, timestamp: new Date() }],
    scores: []
  });
  
  res.json({
    success: true,
    interviewId: id,
    openingQuestion: question,
    avatarVideo: { videoUrl: 'mock-video.mp4', duration: 5, status: 'ready' }
  });
});

app.post('/api/interview/respond', (req, res) => {
  const { interviewId, response } = req.body;
  const interview = interviews.get(interviewId);
  
  if (!interview) {
    return res.status(404).json({ success: false, error: 'Interview not found' });
  }
  
  interview.history.push({ type: 'candidate', content: response, timestamp: new Date() });
  
  const aiQuestions = [
    "That's really interesting! Can you give me a specific example of that?",
    "How did that experience shape your approach to similar situations?",
    "What would you do differently if you faced that challenge again?",
    "Can you walk me through your thought process in that scenario?",
    "That's great! Tell me about a time when you had to work under pressure.",
    "How do you handle conflicts or disagreements in a team environment?",
    "What motivates you most in your professional work?",
    "Where do you see yourself in the next few years?",
    "Do you have any questions about this role or our company?"
  ];
  
  const aiResponse = aiQuestions[Math.floor(Math.random() * aiQuestions.length)];
  let score = 5;
  
  if (response.length > 50) score += 1;
  if (response.length > 100) score += 1;
  if (response.toLowerCase().includes('project')) score += 0.5;
  if (response.toLowerCase().includes('team')) score += 0.5;
  if (response.toLowerCase().includes('experience')) score += 0.5;
  
  score = Math.min(Math.max(score, 1), 10);
  
  interview.history.push({ type: 'ai', content: aiResponse, timestamp: new Date() });
  interview.scores.push({ response, score, timestamp: new Date() });
  
  const avgScore = interview.scores.reduce((acc, s) => acc + s.score, 0) / interview.scores.length;
  
  res.json({
    success: true,
    aiResponse,
    avatarVideo: { videoUrl: 'mock-video.mp4', duration: 4, status: 'ready' },
    scoring: { currentScore: score, topics: ['communication'] },
    sessionStats: {
      totalQuestions: interview.history.filter(h => h.type === 'ai').length,
      totalResponses: interview.history.filter(h => h.type === 'candidate').length,
      averageScore: Math.round(avgScore * 10) / 10
    }
  });
});

app.get('*', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>AI Interview System Pro</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen text-white">
    <div id="root"></div>
    <script type="text/babel">
      const { useState } = React;

      const App = () => {
        const [interviewData, setInterviewData] = useState(null);
        const [response, setResponse] = useState('');
        const [log, setLog] = useState([]);
        const [loading, setLoading] = useState(false);
        const [stats, setStats] = useState({});

        const startInterview = async () => {
          setLoading(true);
          try {
            const res = await fetch('/api/interview/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                candidateId: 'demo_' + Date.now(),
                candidateName: 'Demo User'
              })
            });
            const data = await res.json();
            setInterviewData(data);
            setLog([{ type: 'ai', content: data.openingQuestion, time: new Date().toLocaleTimeString() }]);
          } catch (error) {
            alert('Error: ' + error.message);
          }
          setLoading(false);
        };

        const submitResponse = async () => {
          if (!response.trim()) return;
          
          setLoading(true);
          try {
            const res = await fetch('/api/interview/respond', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                interviewId: interviewData.interviewId,
                response: response
              })
            });
            const data = await res.json();
            
            setLog(prev => [...prev, 
              { type: 'candidate', content: response, time: new Date().toLocaleTimeString() },
              { 
                type: 'ai', 
                content: data.aiResponse, 
                score: data.scoring.currentScore, 
                time: new Date().toLocaleTimeString() 
              }
            ]);
            setStats(data.sessionStats);
            setResponse('');
          } catch (error) {
            alert('Error: ' + error.message);
          }
          setLoading(false);
        };

        return (
          <div className="min-h-screen">
            <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  🤖 AI Interview System Pro
                </h1>
                <div className="text-green-400 text-sm">● System Online</div>
              </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6">
              {!interviewData ? (
                <div className="text-center py-20">
                  <h2 className="text-4xl font-bold mb-6">🎉 AI Interview System is LIVE! 🎉</h2>
                  <p className="text-xl mb-8 text-gray-300">Start your first AI-powered interview experience</p>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-2xl mx-auto mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🎯</div>
                        <h3 className="font-semibold">Smart AI Interviewer</h3>
                        <p className="text-sm text-gray-300">Dynamic questioning & follow-ups</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">📊</div>
                        <h3 className="font-semibold">Real-time Scoring</h3>
                        <p className="text-sm text-gray-300">Instant feedback & analysis</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">🚀</div>
                        <h3 className="font-semibold">Always Available</h3>
                        <p className="text-sm text-gray-300">24/7 interview capability</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={startInterview}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-4 rounded-lg font-semibold transition-all duration-200 text-lg disabled:opacity-50"
                    >
                      {loading ? '🔄 Starting...' : '🎬 Start Demo Interview'}
                    </button>
                  </div>

                  <div className="bg-black/30 rounded-xl p-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold mb-3">✨ Features:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• AI-powered conversations</div>
                      <div>• Real-time response scoring</div>
                      <div>• Dynamic follow-up questions</div>
                      <div>• Professional interview experience</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                      <h2 className="text-xl font-bold mb-4">AI Interviewer - Sarah</h2>
                      
                      <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-8 mb-6 text-center">
                        <div className="text-6xl mb-4">👩‍💼</div>
                        <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm inline-block">
                          {loading ? '🤔 Thinking...' : '👂 Listening'}
                        </div>
                        {stats.averageScore && (
                          <div className="mt-4 text-lg">
                            <span className="text-gray-300">Current Score: </span>
                            <span className="text-green-400 font-bold">{stats.averageScore}/10</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Type your response here... Be detailed and specific for better scores!"
                          className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:border-blue-500 focus:outline-none"
                          disabled={loading}
                        />
                        <button
                          onClick={submitResponse}
                          disabled={!response.trim() || loading}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? '🔄 Processing...' : '📤 Submit Response'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {stats.totalQuestions && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold mb-4">📊 Session Stats</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span>{stats.totalQuestions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Responses:</span>
                            <span>{stats.totalResponses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Score:</span>
                            <span className="text-green-400 font-semibold">{stats.averageScore}/10</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold mb-4">💬 Interview Log</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {log.map((entry, i) => (
                          <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                              <span className={\`text-xs px-2 py-1 rounded-full \${
                                entry.type === 'ai' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                              }\`}>
                                {entry.type === 'ai' ? '🤖 AI Sarah' : '👤 You'}
                              </span>
                              <span className="text-xs text-gray-400">{entry.time}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{entry.content}</p>
                            {entry.score && (
                              <div className="mt-2 text-xs">
                                <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
                                  Score: {entry.score}/10
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {log.length === 0 && (
                          <p className="text-center text-gray-400 py-4">Interview log will appear here</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      };

      ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>`);
});

app.listen(port, () => {
  console.log(\`🚀 AI Interview System running on port \${port}\`);
});
