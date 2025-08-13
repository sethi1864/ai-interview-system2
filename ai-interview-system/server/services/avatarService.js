const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class AvatarService {
  constructor() {
    this.did = null;
    this.heygen = null;
    
    // Initialize D-ID API
    if (process.env.D_ID_API_KEY) {
      this.did = {
        apiKey: process.env.D_ID_API_KEY,
        baseURL: 'https://api.d-id.com'
      };
      logger.avatar('D-ID API initialized successfully');
    }
    
    // Initialize HeyGen API (if available)
    if (process.env.HEYGEN_API_KEY && process.env.HEYGEN_API_KEY !== 'your_heygen_api_key_here') {
      this.heygen = {
        apiKey: process.env.HEYGEN_API_KEY,
        baseURL: 'https://api.heygen.com/v1'
      };
      logger.avatar('HeyGen API initialized successfully');
    }
  }

  // Avatar configurations
  avatarConfigs = {
    'sarah-professional-hr': {
      id: 'sarah-professional-hr',
      name: 'Sarah',
      role: 'HR Professional',
      presenterId: 'd-AQH1v5hqH8J', // D-ID presenter ID
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      voice: 'sarah-professional',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100'
    },
    'john-technical-lead': {
      id: 'john-technical-lead',
      name: 'John',
      role: 'Technical Lead',
      presenterId: 'd-JohnTechLead123',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      voice: 'john-professional',
      background: 'bg-gradient-to-br from-green-50 to-emerald-100'
    },
    'priya-senior-hr': {
      id: 'priya-senior-hr',
      name: 'Priya',
      role: 'Senior HR Manager',
      presenterId: 'd-PriyaSeniorHR456',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      voice: 'priya-professional',
      background: 'bg-gradient-to-br from-purple-50 to-violet-100'
    },
    'david-executive': {
      id: 'david-executive',
      name: 'David',
      role: 'Executive',
      presenterId: 'd-DavidExecutive789',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      voice: 'david-executive',
      background: 'bg-gradient-to-br from-gray-50 to-slate-100'
    }
  };

  async generateAvatarVideo(text, audioUrl, avatarId = null) {
    try {
      if (process.env.DEMO_MODE_ENABLED === 'true') {
        return this.generateDemoVideo(text, avatarId);
      }

      const avatarConfig = avatarId ? this.avatarConfigs[avatarId] : this.avatarConfigs['sarah-professional-hr'];
      
      // Try D-ID first, then HeyGen as fallback
      if (this.did) {
        try {
          return await this.generateWithDID(text, audioUrl, avatarConfig);
        } catch (error) {
          logger.warn('D-ID failed, trying HeyGen:', error.message);
        }
      }
      
      if (this.heygen) {
        try {
          return await this.generateWithHeyGen(text, audioUrl, avatarConfig);
        } catch (error) {
          logger.warn('HeyGen failed:', error.message);
        }
      }
      
      // Fallback to demo video
      return this.generateDemoVideo(text, avatarId);
      
    } catch (error) {
      logger.error('Avatar video generation error:', error);
      return this.generateDemoVideo(text, avatarId);
    }
  }

  async generateWithDID(text, audioUrl, avatarConfig) {
    try {
      // Create talk request
      const talkResponse = await axios.post(`${this.did.baseURL}/talks`, {
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural'
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.0
        },
        presenter_id: avatarConfig.presenterId,
        driver_id: 'uM00mGdxlpk',
        background: {
          color: '#ffffff'
        }
      }, {
        headers: {
          'Authorization': `Basic ${this.did.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const talkId = talkResponse.data.id;
      
      // Poll for completion
      let videoUrl = null;
      for (let i = 0; i < 60; i++) { // Max 60 seconds
        const statusResponse = await axios.get(`${this.did.baseURL}/talks/${talkId}`, {
          headers: {
            'Authorization': `Basic ${this.did.apiKey}`
          }
        });
        
        if (statusResponse.data.status === 'done') {
          videoUrl = statusResponse.data.result_url;
          break;
        } else if (statusResponse.data.status === 'error') {
          throw new Error('Video generation failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!videoUrl) {
        throw new Error('Video generation timeout');
      }
      
      // Download and save the video
      const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const fileName = `avatar_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      await fs.writeFile(filePath, videoResponse.data);
      
      return `/uploads/${fileName}`;
      
    } catch (error) {
      throw new Error(`D-ID video generation failed: ${error.message}`);
    }
  }

  async generateWithHeyGen(text, audioUrl, avatarConfig) {
    try {
      // Create video request
      const videoResponse = await axios.post(`${this.heygen.baseURL}/video.generate`, {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatarConfig.presenterId,
              input_text: text
            },
            voice: {
              type: 'text',
              input_text: text,
              voice_id: avatarConfig.voice
            },
            background: {
              type: 'color',
              value: '#ffffff'
            }
          }
        ],
        test: false,
        aspect_ratio: '16:9'
      }, {
        headers: {
          'X-Api-Key': this.heygen.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      const videoId = videoResponse.data.data.video_id;
      
      // Poll for completion
      let videoUrl = null;
      for (let i = 0; i < 60; i++) { // Max 60 seconds
        const statusResponse = await axios.get(`${this.heygen.baseURL}/video.status?video_id=${videoId}`, {
          headers: {
            'X-Api-Key': this.heygen.apiKey
          }
        });
        
        if (statusResponse.data.data.status === 'completed') {
          videoUrl = statusResponse.data.data.video_url;
          break;
        } else if (statusResponse.data.data.status === 'failed') {
          throw new Error('Video generation failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!videoUrl) {
        throw new Error('Video generation timeout');
      }
      
      // Download and save the video
      const downloadResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const fileName = `avatar_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      await fs.writeFile(filePath, downloadResponse.data);
      
      return `/uploads/${fileName}`;
      
    } catch (error) {
      throw new Error(`HeyGen video generation failed: ${error.message}`);
    }
  }

  async generateAvatarWithEmotion(text, emotion = 'neutral', avatarId = null) {
    // Add emotion-specific modifications
    const emotionModifiers = {
      happy: ' with a warm smile and enthusiastic tone',
      serious: ' with a focused and professional demeanor',
      encouraging: ' with an encouraging and supportive expression',
      neutral: ''
    };
    
    const modifiedText = text + (emotionModifiers[emotion] || '');
    return await this.generateAvatarVideo(modifiedText, null, avatarId);
  }

  async generateAvatarWithGestures(text, gestures = [], avatarId = null) {
    // Add gesture-specific modifications to the text
    const gestureModifiers = {
      nod: ' while nodding in agreement',
      point: ' while gesturing to emphasize the point',
      wave: ' with a friendly wave',
      shrug: ' with a thoughtful shrug'
    };
    
    let modifiedText = text;
    gestures.forEach(gesture => {
      if (gestureModifiers[gesture]) {
        modifiedText += gestureModifiers[gesture];
      }
    });
    
    return await this.generateAvatarVideo(modifiedText, null, avatarId);
  }

  getAvailableAvatars() {
    return Object.keys(this.avatarConfigs).map(key => ({
      id: key,
      ...this.avatarConfigs[key]
    }));
  }

  getAvatarConfig(avatarId) {
    return this.avatarConfigs[avatarId] || this.avatarConfigs['sarah-professional-hr'];
  }

  async generateAvatarPreview(avatarId) {
    const avatarConfig = this.getAvatarConfig(avatarId);
    return {
      image: avatarConfig.image,
      name: avatarConfig.name,
      role: avatarConfig.role
    };
  }

  generateDemoVideo(text, avatarId) {
    // Return a placeholder video URL for demo mode
    const demoVideos = {
      'sarah-professional-hr': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'john-technical-lead': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      'priya-senior-hr': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      'david-executive': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4'
    };
    
    return demoVideos[avatarId] || demoVideos['sarah-professional-hr'];
  }

  async cleanupOldVideos() {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      const files = await fs.readdir(uploadsDir);
      
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      for (const file of files) {
        if (file.startsWith('avatar_') && file.endsWith('.mp4')) {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            logger.avatar(`Cleaned up old avatar video: ${file}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error cleaning up avatar videos:', error);
    }
  }

  healthCheck() {
    return {
      did: !!this.did,
      heygen: !!this.heygen,
      status: this.did || this.heygen ? 'healthy' : 'degraded'
    };
  }
}

module.exports = new AvatarService();