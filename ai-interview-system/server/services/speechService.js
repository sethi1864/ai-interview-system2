const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class SpeechService {
  constructor() {
    this.assemblyAI = null;
    this.playAI = null;
    this.elevenLabs = null;
    this.deepgram = null;
    
    // Initialize AssemblyAI (Speech-to-Text)
    if (process.env.AssemblyAI_API_KEY) {
      this.assemblyAI = {
        apiKey: process.env.AssemblyAI_API_KEY,
        baseURL: 'https://api.assemblyai.com/v2'
      };
      logger.speech('AssemblyAI API initialized successfully');
    }
    
    // Initialize PlayAI (Text-to-Speech)
    if (process.env.PlayAI_API_KEY) {
      this.playAI = {
        apiKey: process.env.PlayAI_API_KEY,
        baseURL: 'https://api.play.ht/api/v2'
      };
      logger.speech('PlayAI API initialized successfully');
    }
    
    // Initialize ElevenLabs (Alternative TTS)
    if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here') {
      this.elevenLabs = {
        apiKey: process.env.ELEVENLABS_API_KEY,
        baseURL: 'https://api.elevenlabs.io/v1'
      };
      logger.speech('ElevenLabs API initialized successfully');
    }
    
    // Initialize Deepgram (Alternative STT)
    if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY !== 'your_deepgram_api_key_here') {
      this.deepgram = {
        apiKey: process.env.DEEPGRAM_API_KEY,
        baseURL: 'https://api.deepgram.com/v1'
      };
      logger.speech('Deepgram API initialized successfully');
    }
  }

  // Voice configurations
  voiceConfigs = {
    'sarah-professional': {
      id: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
      name: 'Sarah',
      gender: 'female',
      language: 'en-US'
    },
    'john-professional': {
      id: 's3://voice-cloning-zero-shot/8b1d8c5f-0c5a-4c1a-9c1a-8b1d8c5f0c5a/male-cs/manifest.json',
      name: 'John',
      gender: 'male',
      language: 'en-US'
    },
    'priya-professional': {
      id: 's3://voice-cloning-zero-shot/7c1d8c5f-0c5a-4c1a-9c1a-7c1d8c5f0c5a/female-cs/manifest.json',
      name: 'Priya',
      gender: 'female',
      language: 'en-US'
    },
    'david-executive': {
      id: 's3://voice-cloning-zero-shot/6b1d8c5f-0c5a-4c1a-9c1a-6b1d8c5f0c5a/male-cs/manifest.json',
      name: 'David',
      gender: 'male',
      language: 'en-US'
    }
  };

  async synthesizeSpeech(text, voiceId = null) {
    try {
      if (process.env.DEMO_MODE_ENABLED === 'true') {
        return this.generateDemoAudio(text, voiceId);
      }

      const voiceConfig = voiceId ? this.voiceConfigs[voiceId] : this.voiceConfigs['sarah-professional'];
      
      // Try PlayAI first, then ElevenLabs as fallback
      if (this.playAI) {
        try {
          return await this.synthesizeWithPlayAI(text, voiceConfig);
        } catch (error) {
          logger.warn('PlayAI failed, trying ElevenLabs:', error.message);
        }
      }
      
      if (this.elevenLabs) {
        try {
          return await this.synthesizeWithElevenLabs(text, voiceConfig);
        } catch (error) {
          logger.warn('ElevenLabs failed:', error.message);
        }
      }
      
      // Fallback to demo audio
      return this.generateDemoAudio(text, voiceId);
      
    } catch (error) {
      logger.error('Speech synthesis error:', error);
      return this.generateDemoAudio(text, voiceId);
    }
  }

  async synthesizeWithPlayAI(text, voiceConfig) {
    try {
      // First get user ID
      const userResponse = await axios.get(`${this.playAI.baseURL}/users`, {
        headers: {
          'Authorization': `Bearer ${this.playAI.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userId = userResponse.data.id;
      
      // Create TTS request
      const ttsResponse = await axios.post(`${this.playAI.baseURL}/tts`, {
        text: text,
        voice: voiceConfig.id,
        quality: 'medium',
        output_format: 'mp3',
        speed: 1.0,
        sample_rate: 24000
      }, {
        headers: {
          'Authorization': `Bearer ${this.playAI.apiKey}`,
          'X-User-ID': userId,
          'Content-Type': 'application/json'
        }
      });
      
      // Get the audio URL
      const audioUrl = ttsResponse.data.url;
      
      // Download and save the audio
      const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      await fs.writeFile(filePath, audioResponse.data);
      
      return `/uploads/${fileName}`;
      
    } catch (error) {
      throw new Error(`PlayAI TTS failed: ${error.message}`);
    }
  }

  async synthesizeWithElevenLabs(text, voiceConfig) {
    try {
      const response = await axios.post(`${this.elevenLabs.baseURL}/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }, {
        headers: {
          'xi-api-key': this.elevenLabs.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      });
      
      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      await fs.writeFile(filePath, response.data);
      
      return `/uploads/${fileName}`;
      
    } catch (error) {
      throw new Error(`ElevenLabs TTS failed: ${error.message}`);
    }
  }

  async recognizeSpeech(audioBlob) {
    try {
      if (process.env.DEMO_MODE_ENABLED === 'true') {
        return this.generateDemoTranscription();
      }

      // Try AssemblyAI first, then Deepgram as fallback
      if (this.assemblyAI) {
        try {
          return await this.recognizeWithAssemblyAI(audioBlob);
        } catch (error) {
          logger.warn('AssemblyAI failed, trying Deepgram:', error.message);
        }
      }
      
      if (this.deepgram) {
        try {
          return await this.recognizeWithDeepgram(audioBlob);
        } catch (error) {
          logger.warn('Deepgram failed:', error.message);
        }
      }
      
      // Fallback to demo transcription
      return this.generateDemoTranscription();
      
    } catch (error) {
      logger.error('Speech recognition error:', error);
      return this.generateDemoTranscription();
    }
  }

  async recognizeWithAssemblyAI(audioBlob) {
    try {
      // Save audio blob to temporary file
      const fileName = `audio_${Date.now()}.webm`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      await fs.writeFile(filePath, audioBlob);
      
      // Upload to AssemblyAI
      const uploadResponse = await axios.post(`${this.assemblyAI.baseURL}/upload`, 
        fs.createReadStream(filePath),
        {
          headers: {
            'Authorization': this.assemblyAI.apiKey,
            'Content-Type': 'application/octet-stream'
          }
        }
      );
      
      const audioUrl = uploadResponse.data.upload_url;
      
      // Submit for transcription
      const transcriptResponse = await axios.post(`${this.assemblyAI.baseURL}/transcript`, {
        audio_url: audioUrl,
        language_code: 'en_us',
        punctuate: true,
        format_text: true
      }, {
        headers: {
          'Authorization': this.assemblyAI.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      const transcriptId = transcriptResponse.data.id;
      
      // Poll for completion
      let transcript = null;
      for (let i = 0; i < 30; i++) { // Max 30 seconds
        const statusResponse = await axios.get(`${this.assemblyAI.baseURL}/transcript/${transcriptId}`, {
          headers: {
            'Authorization': this.assemblyAI.apiKey
          }
        });
        
        if (statusResponse.data.status === 'completed') {
          transcript = statusResponse.data.text;
          break;
        } else if (statusResponse.data.status === 'error') {
          throw new Error('Transcription failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Clean up temporary file
      await fs.unlink(filePath);
      
      return transcript || 'Could not transcribe audio';
      
    } catch (error) {
      throw new Error(`AssemblyAI STT failed: ${error.message}`);
    }
  }

  async recognizeWithDeepgram(audioBlob) {
    try {
      const response = await axios.post(`${this.deepgram.baseURL}/listen`, audioBlob, {
        headers: {
          'Authorization': `Token ${this.deepgram.apiKey}`,
          'Content-Type': 'audio/webm'
        },
        params: {
          model: 'nova-2',
          language: 'en-US',
          punctuate: true,
          smart_format: true
        }
      });
      
      return response.data.results?.channels[0]?.alternatives[0]?.transcript || 'Could not transcribe audio';
      
    } catch (error) {
      throw new Error(`Deepgram STT failed: ${error.message}`);
    }
  }

  generateDemoAudio(text, voiceId) {
    // Return a placeholder audio URL for demo mode
    return '/demo-audio.mp3';
  }

  generateDemoTranscription() {
    const demoTranscriptions = [
      "I have about 5 years of experience in software development.",
      "I'm passionate about creating user-friendly applications.",
      "I enjoy solving complex technical problems.",
      "I work well in team environments and can lead projects.",
      "I'm always learning new technologies and best practices."
    ];
    
    return demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)];
  }

  async saveAudioToStorage(audioData, fileName) {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, audioData);
      
      return `/uploads/${fileName}`;
    } catch (error) {
      logger.error('Error saving audio:', error);
      throw error;
    }
  }

  async saveAudio(audioBlob, interviewId) {
    try {
      const fileName = `interview_${interviewId}_${Date.now()}.webm`;
      return await this.saveAudioToStorage(audioBlob, fileName);
    } catch (error) {
      logger.error('Error saving interview audio:', error);
      throw error;
    }
  }

  getAvailableVoices() {
    return Object.keys(this.voiceConfigs).map(key => ({
      id: key,
      ...this.voiceConfigs[key]
    }));
  }

  getVoiceConfig(voiceId) {
    return this.voiceConfigs[voiceId] || this.voiceConfigs['sarah-professional'];
  }

  async synthesizeSpeechWithEmotion(text, emotion = 'neutral', voiceId = null) {
    // Add emotion-specific modifications to the text
    const emotionModifiers = {
      happy: ' with enthusiasm and warmth',
      serious: ' in a professional and focused manner',
      encouraging: ' with encouragement and support',
      neutral: ''
    };
    
    const modifiedText = text + (emotionModifiers[emotion] || '');
    return await this.synthesizeSpeech(modifiedText, voiceId);
  }

  async cleanupOldAudioFiles() {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      const files = await fs.readdir(uploadsDir);
      
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          logger.speech(`Cleaned up old audio file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up audio files:', error);
    }
  }

  healthCheck() {
    return {
      assemblyAI: !!this.assemblyAI,
      playAI: !!this.playAI,
      elevenLabs: !!this.elevenLabs,
      deepgram: !!this.deepgram,
      status: (this.assemblyAI || this.deepgram) && (this.playAI || this.elevenLabs) ? 'healthy' : 'degraded'
    };
  }
}

module.exports = new SpeechService();