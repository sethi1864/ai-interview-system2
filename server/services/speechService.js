const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Voice configurations
const voiceConfigs = {
  'professional-female-sarah': {
    id: 'professional-female-sarah',
    name: 'Sarah',
    gender: 'female',
    language: 'en',
    accent: 'american',
    style: 'professional',
    stability: 0.75,
    similarity: 0.85,
    style_boost: 0.35
  },
  'professional-male-john': {
    id: 'professional-male-john',
    name: 'John',
    gender: 'male',
    language: 'en',
    accent: 'american',
    style: 'professional',
    stability: 0.75,
    similarity: 0.85,
    style_boost: 0.35
  },
  'professional-female-priya': {
    id: 'professional-female-priya',
    name: 'Priya',
    gender: 'female',
    language: 'en',
    accent: 'indian',
    style: 'professional',
    stability: 0.75,
    similarity: 0.85,
    style_boost: 0.35
  },
  'professional-male-david': {
    id: 'professional-male-david',
    name: 'David',
    gender: 'male',
    language: 'en',
    accent: 'british',
    style: 'executive',
    stability: 0.80,
    similarity: 0.90,
    style_boost: 0.40
  }
};

class SpeechService {
  constructor() {
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    this.elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
    this.deepgramBaseUrl = 'https://api.deepgram.com/v1';
    this.defaultVoice = 'professional-female-sarah';
  }

  // Convert text to speech using ElevenLabs
  async synthesizeSpeech(text, voiceId = null) {
    try {
      const voiceConfig = voiceConfigs[voiceId || this.defaultVoice];
      
      if (!voiceConfig) {
        throw new Error(`Voice configuration not found for ID: ${voiceId}`);
      }

      // For demo mode, return a placeholder audio URL
      if (process.env.DEMO_MODE_ENABLED === 'true') {
        return this.generateDemoAudio(text, voiceConfig);
      }

      // Prepare the text-to-speech request
      const ttsData = {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: voiceConfig.stability,
          similarity_boost: voiceConfig.similarity,
          style: voiceConfig.style_boost,
          use_speaker_boost: true
        }
      };

      // Make API call to ElevenLabs
      const response = await axios.post(
        `${this.elevenLabsBaseUrl}/text-to-speech/${voiceConfig.id}`,
        ttsData,
        {
          headers: {
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data) {
        // Save audio to temporary file or cloud storage
        const audioUrl = await this.saveAudioToStorage(response.data, `tts_${Date.now()}.mp3`);
        
        logger.speech(`Generated speech for voice ${voiceConfig.name}`);
        return audioUrl;
      } else {
        throw new Error('Invalid response from ElevenLabs API');
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'synthesizeSpeech', 
        voiceId, 
        textLength: text.length 
      });
      
      // Fallback to demo audio
      return this.generateDemoAudio(text, voiceConfigs[voiceId || this.defaultVoice]);
    }
  }

  // Generate demo audio (for testing without API keys)
  generateDemoAudio(text, voiceConfig) {
    // Return a placeholder audio URL
    const demoAudios = {
      'professional-female-sarah': 'https://demo-audio.elevenlabs.com/sarah-interview.mp3',
      'professional-male-john': 'https://demo-audio.elevenlabs.com/john-interview.mp3',
      'professional-female-priya': 'https://demo-audio.elevenlabs.com/priya-interview.mp3',
      'professional-male-david': 'https://demo-audio.elevenlabs.com/david-interview.mp3'
    };

    logger.speech(`Using demo audio for ${voiceConfig.name}`);
    return demoAudios[voiceConfig.id] || demoAudios['professional-female-sarah'];
  }

  // Convert speech to text using Deepgram
  async recognizeSpeech(audioBlob) {
    try {
      // For demo mode, return a placeholder transcript
      if (process.env.DEMO_MODE_ENABLED === 'true') {
        return this.generateDemoTranscript();
      }

      // Convert blob to buffer
      const audioBuffer = Buffer.from(audioBlob, 'base64');

      // Prepare the speech-to-text request
      const formData = new FormData();
      formData.append('audio', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav'
      });

      // Make API call to Deepgram
      const response = await axios.post(
        `${this.deepgramBaseUrl}/listen?model=nova-2&language=en&punctuate=true&diarize=true&smart_format=true`,
        formData,
        {
          headers: {
            'Authorization': `Token ${this.deepgramApiKey}`,
            ...formData.getHeaders()
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data && response.data.results && response.data.results.channels) {
        const transcript = response.data.results.channels[0].alternatives[0].transcript;
        
        logger.speech(`Generated transcript: ${transcript.substring(0, 50)}...`);
        return transcript;
      } else {
        throw new Error('Invalid response from Deepgram API');
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'recognizeSpeech', 
        audioSize: audioBlob ? audioBlob.length : 0 
      });
      
      // Fallback to demo transcript
      return this.generateDemoTranscript();
    }
  }

  // Generate demo transcript (for testing without API keys)
  generateDemoTranscript() {
    const demoTranscripts = [
      "I have over 5 years of experience in software development, primarily working with JavaScript and React.",
      "In my previous role, I led a team of 6 developers and successfully delivered a major e-commerce platform.",
      "I'm passionate about creating user-friendly applications and solving complex technical challenges.",
      "I believe my experience with cloud technologies and agile methodologies would be valuable for this position.",
      "I'm excited about the opportunity to work with your team and contribute to innovative projects."
    ];

    const randomTranscript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
    logger.speech(`Using demo transcript: ${randomTranscript.substring(0, 50)}...`);
    return randomTranscript;
  }

  // Save audio to storage (local file system or cloud storage)
  async saveAudioToStorage(audioBuffer, filename) {
    try {
      // For now, save to local file system
      // In production, this should be saved to cloud storage (AWS S3, etc.)
      const uploadsDir = path.join(__dirname, '../../uploads/audio');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, audioBuffer);

      // Return the file URL (in production, this would be a cloud storage URL)
      const fileUrl = `/uploads/audio/${filename}`;
      
      logger.speech(`Saved audio file: ${filename}`);
      return fileUrl;

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'saveAudioToStorage', 
        filename 
      });
      
      // Return a placeholder URL
      return `/uploads/audio/${filename}`;
    }
  }

  // Save candidate audio
  async saveAudio(audioBlob) {
    try {
      const audioBuffer = Buffer.from(audioBlob, 'base64');
      const filename = `candidate_${Date.now()}.wav`;
      
      return await this.saveAudioToStorage(audioBuffer, filename);
    } catch (error) {
      logger.errorWithContext(error, { method: 'saveAudio' });
      return null;
    }
  }

  // Get available voices
  getAvailableVoices() {
    return Object.keys(voiceConfigs).map(id => ({
      id,
      ...voiceConfigs[id]
    }));
  }

  // Validate voice ID
  isValidVoice(voiceId) {
    return voiceConfigs.hasOwnProperty(voiceId);
  }

  // Get voice configuration
  getVoiceConfig(voiceId) {
    return voiceConfigs[voiceId] || voiceConfigs[this.defaultVoice];
  }

  // Generate speech with specific emotions
  async synthesizeSpeechWithEmotion(text, emotion, voiceId = null) {
    try {
      const voiceConfig = voiceConfigs[voiceId || this.defaultVoice];
      
      // Add emotion-specific voice settings
      const emotionSettings = this.getEmotionSettings(emotion);
      
      const ttsData = {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          ...voiceConfig,
          ...emotionSettings
        }
      };

      const response = await axios.post(
        `${this.elevenLabsBaseUrl}/text-to-speech/${voiceConfig.id}`,
        ttsData,
        {
          headers: {
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      if (response.data) {
        const audioUrl = await this.saveAudioToStorage(response.data, `tts_emotion_${Date.now()}.mp3`);
        
        logger.speech(`Generated emotional speech (${emotion}) for voice ${voiceConfig.name}`);
        return audioUrl;
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'synthesizeSpeechWithEmotion', 
        emotion, 
        voiceId 
      });
      
      // Fallback to regular speech synthesis
      return this.synthesizeSpeech(text, voiceId);
    }
  }

  // Get emotion-specific voice settings
  getEmotionSettings(emotion) {
    const emotions = {
      'happy': { 
        stability: 0.8, 
        similarity_boost: 0.9, 
        style: 0.5 
      },
      'neutral': { 
        stability: 0.75, 
        similarity_boost: 0.85, 
        style: 0.35 
      },
      'concerned': { 
        stability: 0.7, 
        similarity_boost: 0.8, 
        style: 0.2 
      },
      'excited': { 
        stability: 0.6, 
        similarity_boost: 0.9, 
        style: 0.6 
      },
      'thoughtful': { 
        stability: 0.8, 
        similarity_boost: 0.85, 
        style: 0.3 
      }
    };

    return emotions[emotion] || emotions['neutral'];
  }

  // Health check for speech services
  async healthCheck() {
    const results = {
      elevenLabs: { status: 'unknown' },
      deepgram: { status: 'unknown' }
    };

    try {
      // Check ElevenLabs
      const elevenLabsResponse = await axios.get(`${this.elevenLabsBaseUrl}/voices`, {
        headers: {
          'xi-api-key': this.elevenLabsApiKey
        },
        timeout: 5000
      });

      results.elevenLabs = {
        status: 'healthy',
        voices: elevenLabsResponse.data.voices?.length || 0
      };
    } catch (error) {
      results.elevenLabs = {
        status: 'unhealthy',
        error: error.message
      };
    }

    try {
      // Check Deepgram
      const deepgramResponse = await axios.get(`${this.deepgramBaseUrl}/usage`, {
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`
        },
        timeout: 5000
      });

      results.deepgram = {
        status: 'healthy',
        usage: deepgramResponse.data
      };
    } catch (error) {
      results.deepgram = {
        status: 'unhealthy',
        error: error.message
      };
    }

    return results;
  }

  // Clean up old audio files
  async cleanupOldAudioFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/audio');
      
      if (!fs.existsSync(uploadsDir)) {
        return;
      }

      const files = fs.readdirSync(uploadsDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          logger.speech(`Cleaned up old audio file: ${file}`);
        }
      }
    } catch (error) {
      logger.errorWithContext(error, { method: 'cleanupOldAudioFiles' });
    }
  }
}

module.exports = new SpeechService();