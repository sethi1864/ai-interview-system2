const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple in-memory storage
const interviews = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', activeInterviews: interviews.size });
});

// Start interview
app.post('/api/interview/start', (req, res) => {
  const id = 'demo_' + Date.now();
  const question = "Hello! I'm Sarah from HR. Tell me about yourself and what interests you about this position?";
  
  interviews.set(id, {
    id,
    history: [{ type: 'ai', content: question }]
  });
  
  res.json({
    success: true,
    interviewId: id,
    openingQuestion: question
  });
});

// Respond to interview
app.post('/api/interview/respond', (req, res) => {
  const { interviewId, response } = req.body;
  const interview = interviews.get(interviewId);
  
  if (!interview) {
    return res.status(404).json({ success: false, error: 'Interview not found' });
  }
  
  // Add candidate response
  interview.history.push({ type: 'candidate', content: response });
  
  // Generate AI response
  const aiResponses = [
    "That's interesting! Can you give me a specific example?",
    "How did that experience help you grow professionally?",
    "What challenges did you face and how did you overcome them?",
    "Tell me about your role in that project.",
    "What motivates you in your work?"
  ];
  
  const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
  interview.history.push({ type: 'ai', content: aiResponse });
  
  // Simple scoring
  let score = 5;
  if (response.length > 50) score += 2;
  if (response.toLowerCase().includes('team')) score += 1;
  if (response.toLowerCase().includes('project')) score += 1;
  
  res.json({
    success: true,
    aiResponse,
    scoring: { currentScore: Math.min(score, 10) }
  });
});

// Serve simple HTML page
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>AI Interview System</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .card { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 20px 0; }
        button { background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
        button:hover { background: #45a049; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; border: none; border-radius: 5px; }
        .log { text-align: left; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 10px 0; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Interview System Pro</h1>
        <p>Your AI Interview System is LIVE and Working! ✅</p>
        
        <div id="start-screen" class="card">
            <h2>🎉 Start Your AI Interview</h2>
            <p>Click below to begin your interview with AI Sarah</p>
            <button onclick="startInterview()">🎬 Start Demo Interview</button>
        </div>
        
        <div id="interview-screen" class="card hidden">
            <h2>AI Interviewer - Sarah 👩‍💼</h2>
            <div id="question-display" class="log"></div>
            <textarea id="response-input" placeholder="Type your response here..." rows="4"></textarea>
            <button onclick="submitResponse()">📤 Submit Response</button>
            <div id="score-display"></div>
        </div>
        
        <div id="interview-log" class="card hidden">
            <h3>💬 Interview Log</h3>
            <div id="log-content"></div>
        </div>
    </div>

    <script>
        let interviewData = null;
        let log = [];
        
        async function startInterview() {
            try {
                const response = await fetch('/api/interview/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ candidateId: 'demo_' + Date.now() })
                });
                
                const data = await response.json();
                interviewData = data;
                
                document.getElementById('start-screen').classList.add('hidden');
                document.getElementById('interview-screen').classList.remove('hidden');
                document.getElementById('interview-log').classList.remove('hidden');
                
                document.getElementById('question-display').innerHTML = 
                    '<strong>🤖 AI Sarah:</strong> ' + data.openingQuestion;
                    
                addToLog('ai', data.openingQuestion);
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        async function submitResponse() {
            const responseText = document.getElementById('response-input').value.trim();
            if (!responseText) return;
            
            try {
                const response = await fetch('/api/interview/respond', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        interviewId: interviewData.interviewId,
                        response: responseText
                    })
                });
                
                const data = await response.json();
                
                addToLog('candidate', responseText);
                addToLog('ai', data.aiResponse);
                
                document.getElementById('question-display').innerHTML = 
                    '<strong>🤖 AI Sarah:</strong> ' + data.aiResponse;
                    
                document.getElementById('score-display').innerHTML = 
                    '<div style="color: #4CAF50; margin: 10px 0;">Score: ' + data.scoring.currentScore + '/10</div>';
                    
                document.getElementById('response-input').value = '';
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        function addToLog(type, content) {
            const time = new Date().toLocaleTimeString();
            const logItem = '<div class="log"><strong>' + 
                (type === 'ai' ? '🤖 AI Sarah' : '👤 You') + 
                '</strong> (' + time + ')<br>' + content + '</div>';
                
            document.getElementById('log-content').innerHTML += logItem;
        }
        
        // Test API on load
        fetch('/api/health').then(r => r.json()).then(data => {
            console.log('System Status:', data.status);
        });
    </script>
</body>
</html>`);
});

app.listen(port, () => {
  console.log('🚀 AI Interview System running on port ' + port);
});
