require('dotenv').config();
const axios = require('axios');

console.log('🔍 Testing API Keys...\n');

// Test Gemini API
async function testGeminiAPI() {
  console.log('1. Testing Gemini API...');
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Hello, this is a test message. Please respond with 'API working' if you can see this."
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.candidates && response.data.candidates[0]) {
      console.log('✅ Gemini API: WORKING');
      console.log('   Response:', response.data.candidates[0].content.parts[0].text.substring(0, 100) + '...');
    } else {
      console.log('❌ Gemini API: Invalid response format');
    }
  } catch (error) {
    console.log('❌ Gemini API: FAILED');
    console.log('   Error:', error.response?.data?.error?.message || error.message);
  }
  console.log('');
}

// Test D-ID API
async function testDIDAPI() {
  console.log('2. Testing D-ID API...');
  try {
    // D-ID API key format: email:password (base64 encoded)
    const response = await axios.get('https://api.d-id.com/talks', {
      headers: {
        'Authorization': `Basic ${process.env.D_ID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ D-ID API: WORKING');
    console.log('   Available talks:', response.data.length || 0);
  } catch (error) {
    console.log('❌ D-ID API: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    console.log('   Note: D-ID API key should be in format: email:password (base64 encoded)');
  }
  console.log('');
}

// Test PlayAI API
async function testPlayAIAPI() {
  console.log('3. Testing PlayAI API...');
  try {
    // First, let's try to get user info to get the user ID
    const userResponse = await axios.get('https://api.play.ht/api/v2/users', {
      headers: {
        'Authorization': `Bearer ${process.env.PlayAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userId = userResponse.data.id;
    console.log('   User ID found:', userId);
    
    const response = await axios.get('https://api.play.ht/api/v2/voices', {
      headers: {
        'Authorization': `Bearer ${process.env.PlayAI_API_KEY}`,
        'X-User-ID': userId,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ PlayAI API: WORKING');
    console.log('   Available voices:', response.data.length || 0);
  } catch (error) {
    console.log('❌ PlayAI API: FAILED');
    console.log('   Error:', error.response?.data?.message || error.message);
    if (error.response?.status === 403) {
      console.log('   Note: PlayAI API might need account verification or different permissions');
    }
  }
  console.log('');
}

// Test AssemblyAI API
async function testAssemblyAIAPI() {
  console.log('4. Testing AssemblyAI API...');
  try {
    const response = await axios.get('https://api.assemblyai.com/v2/transcript', {
      headers: {
        'Authorization': process.env.AssemblyAI_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ AssemblyAI API: WORKING');
    console.log('   API accessible');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ AssemblyAI API: WORKING (404 expected for empty transcript list)');
    } else {
      console.log('❌ AssemblyAI API: FAILED');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
  }
  console.log('');
}

// Test OpenAI API (if provided)
async function testOpenAIAPI() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    console.log('5. Testing OpenAI API...');
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: 'Hello, this is a test. Please respond with "API working" if you can see this.'
          }],
          max_tokens: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ OpenAI API: WORKING');
      console.log('   Response:', response.data.choices[0].message.content);
    } catch (error) {
      console.log('❌ OpenAI API: FAILED');
      console.log('   Error:', error.response?.data?.error?.message || error.message);
    }
    console.log('');
  }
}

// Test ElevenLabs API (if provided)
async function testElevenLabsAPI() {
  if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here') {
    console.log('6. Testing ElevenLabs API...');
    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
      });
      console.log('✅ ElevenLabs API: WORKING');
      console.log('   Available voices:', response.data.voices?.length || 0);
    } catch (error) {
      console.log('❌ ElevenLabs API: FAILED');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    console.log('');
  }
}

// Test Deepgram API (if provided)
async function testDeepgramAPI() {
  if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY !== 'your_deepgram_api_key_here') {
    console.log('7. Testing Deepgram API...');
    try {
      const response = await axios.get('https://api.deepgram.com/v1/projects', {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
        }
      });
      console.log('✅ Deepgram API: WORKING');
      console.log('   Projects:', response.data.projects?.length || 0);
    } catch (error) {
      console.log('❌ Deepgram API: FAILED');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    console.log('');
  }
}

// Test HeyGen API (if provided)
async function testHeyGenAPI() {
  if (process.env.HEYGEN_API_KEY && process.env.HEYGEN_API_KEY !== 'your_heygen_api_key_here') {
    console.log('8. Testing HeyGen API...');
    try {
      const response = await axios.get('https://api.heygen.com/v1/video.list', {
        headers: {
          'X-Api-Key': process.env.HEYGEN_API_KEY
        }
      });
      console.log('✅ HeyGen API: WORKING');
      console.log('   Videos:', response.data.data?.list?.length || 0);
    } catch (error) {
      console.log('❌ HeyGen API: FAILED');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    console.log('');
  }
}

// Run all tests
async function runAllTests() {
  await testGeminiAPI();
  await testDIDAPI();
  await testPlayAIAPI();
  await testAssemblyAIAPI();
  await testOpenAIAPI();
  await testElevenLabsAPI();
  await testDeepgramAPI();
  await testHeyGenAPI();
  
  console.log('🎯 API Testing Complete!');
  console.log('\n📋 Summary:');
  console.log('- Gemini API: Alternative to OpenAI for text generation');
  console.log('- D-ID API: For avatar video generation');
  console.log('- PlayAI API: Alternative to ElevenLabs for text-to-speech');
  console.log('- AssemblyAI API: Alternative to Deepgram for speech-to-text');
}

runAllTests().catch(console.error);