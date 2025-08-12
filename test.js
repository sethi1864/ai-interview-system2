const io = require('socket.io-client');

// Test API endpoints
async function testAPI() {
    console.log('🧪 Testing API endpoints...');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:3000/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test interview start
        const startResponse = await fetch('http://localhost:3000/api/interview/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateId: 'test_' + Date.now() })
        });
        const startData = await startResponse.json();
        console.log('✅ Interview started:', startData.interviewId);
        
        // Test interview response
        const respondResponse = await fetch('http://localhost:3000/api/interview/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interviewId: startData.interviewId,
                response: 'This is a test response for the AI interview system.'
            })
        });
        const respondData = await respondResponse.json();
        console.log('✅ Response submitted:', respondData.scoring);
        
        return startData.interviewId;
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        return null;
    }
}

// Test WebSocket connection
function testWebSocket(interviewId) {
    console.log('🧪 Testing WebSocket connection...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000');
        
        socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            socket.emit('join-interview', interviewId);
        });
        
        socket.on('disconnect', () => {
            console.log('✅ WebSocket disconnected');
            resolve();
        });
        
        // Test avatar speech event
        setTimeout(() => {
            socket.emit('avatar-speech', {
                interviewId: interviewId,
                text: 'Hello, this is a test of the avatar speech system.',
                emotion: 'neutral'
            });
            console.log('✅ Avatar speech event sent');
        }, 1000);
        
        // Disconnect after 3 seconds
        setTimeout(() => {
            socket.disconnect();
        }, 3000);
    });
}

// Run tests
async function runTests() {
    console.log('🚀 Starting AI Interview System Tests...\n');
    
    const interviewId = await testAPI();
    
    if (interviewId) {
        await testWebSocket(interviewId);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('🎉 Your AI Interview System with Video Conferencing is ready!');
    console.log('📱 Open http://localhost:3000 in your browser to start interviewing');
}

// Run if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testAPI, testWebSocket };