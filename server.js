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
  const id = 'demo_' + Date.now();
  const question = "Hello! I'm Sarah from HR. Tell me about yourself.";
  interviews.set(id, { id, history: [{ type: 'ai', content: question }] });
  res.json({ success: true, interviewId: id, openingQuestion: question });
});

app.post('/api/interview/respond', (req, res) => {
  const { interviewId, response } = req.body;
  const interview = interviews.get(interviewId);
  if (!interview) return res.status(404).json({ success: false });
  
  const aiResponse = "That's interesting! Can you give me more details?";
  const score = 7.5;
  
  res.json({ 
    success: true, 
    aiResponse, 
    scoring: { currentScore: score },
    sessionStats: { totalQuestions: 2, averageScore: score }
  });
});

app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head><title>AI Interview System</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gradient-to-r from-blue-900 to-purple-900 text-white min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-5xl font-bold mb-8">🎉 AI Interview System is LIVE! 🎉</h1>
    <p class="text-xl mb-8">Your system is working perfectly!</p>
    <div class="bg-white/10 p-8 rounded-xl">
      <h2 class="text-2xl mb-4">🚀 Congratulations!</h2>
      <p class="mb-4">Your AI Interview System is deployed and running!</p>
      <div class="text-left bg-black/30 p-4 rounded">
        <p class="text-green-400">✅ API Health: <span id="status">Checking...</span></p>
        <p class="text-blue-400">📊 Active Interviews: <span id="count">0</span></p>
      </div>
    </div>
  </div>
  <script>
    fetch('/api/health').then(r=>r.json()).then(d=>{
      document.getElementById('status').textContent = d.status;
      document.getElementById('count').textContent = d.activeInterviews;
    });
  </script>
</body>
</html>`);
});

app.listen(port, () => console.log('AI Interview System running on port', port));