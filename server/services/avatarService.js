const axios = require('axios');
const logger = require('../utils/logger');

// Avatar configurations
const avatarConfigs = {
  'sarah-professional-hr': {
    id: 'sarah-professional-hr',
    name: 'Sarah',
    role: 'HR Professional',
    voiceId: 'professional-female-sarah',
    background: 'office-environment',
    style: 'professional',
    emotions: true,
    gestures: true
  },
  'john-technical-lead': {
    id: 'john-technical-lead',
    name: 'John',
    role: 'Technical Lead',
    voiceId: 'professional-male-john',
    background: 'office-environment',
    style: 'technical',
    emotions: true,
    gestures: true
  },
  'priya-senior-hr': {
    id: 'priya-senior-hr',
    name: 'Priya',
    role: 'Senior HR Manager',
    voiceId: 'professional-female-priya',
    background: 'office-environment',
    style: 'senior',
    emotions: true,
    gestures: true
  },
  'david-executive': {
    id: 'david-executive',
    name: 'David',
    role: 'Executive',
    voiceId: 'professional-male-david',
    background: 'executive-office',
    style: 'executive',
    emotions: true,
    gestures: true
  }
};

class AvatarService {
  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY;
    this.baseUrl = 'https://api.heygen.com/v1';
    this.defaultAvatar = 'sarah-professional-hr';
  }

  // Generate avatar video with lip-sync
  async generateAvatarVideo(text, audioUrl, avatarId = null) {
    try {
      const avatarConfig = avatarConfigs[avatarId || this.defaultAvatar];
      
      if (!avatarConfig) {
        throw new Error(`Avatar configuration not found for ID: ${avatarId}`);
      }

      // For demo mode, return a placeholder video
      if (process.env.DEMO_MODE_ENABLED === 'true') {
        return this.generateDemoVideo(text, avatarConfig);
      }

      // Prepare the video generation request
      const videoData = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarConfig.id,
              input_audio: audioUrl
            },
            background: {
              type: "image",
              image_url: this.getBackgroundUrl(avatarConfig.background)
            },
            voice: {
              type: "text",
              input_text: text,
              voice_id: avatarConfig.voiceId
            }
          }
        ],
        test: false,
        aspect_ratio: "16:9",
        quality: "high",
        output_format: "mp4"
      };

      // Make API call to HeyGen
      const response = await axios.post(
        `${this.baseUrl}/video/generate`,
        videoData,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data && response.data.data && response.data.data.video_url) {
        logger.avatar(`Generated avatar video for ${avatarConfig.name}`);
        return response.data.data.video_url;
      } else {
        throw new Error('Invalid response from HeyGen API');
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'generateAvatarVideo', 
        avatarId, 
        textLength: text.length 
      });
      
      // Fallback to demo video
      return this.generateDemoVideo(text, avatarConfigs[avatarId || this.defaultAvatar]);
    }
  }

  // Generate demo video (for testing without API keys)
  generateDemoVideo(text, avatarConfig) {
    // Return a placeholder video URL or base64 encoded video
    const demoVideos = {
      'sarah-professional-hr': 'https://demo-videos.heygen.com/sarah-interview.mp4',
      'john-technical-lead': 'https://demo-videos.heygen.com/john-interview.mp4',
      'priya-senior-hr': 'https://demo-videos.heygen.com/priya-interview.mp4',
      'david-executive': 'https://demo-videos.heygen.com/david-interview.mp4'
    };

    logger.avatar(`Using demo video for ${avatarConfig.name}`);
    return demoVideos[avatarConfig.id] || demoVideos['sarah-professional-hr'];
  }

  // Get background URL based on avatar type
  getBackgroundUrl(backgroundType) {
    const backgrounds = {
      'office-environment': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop',
      'executive-office': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=1080&fit=crop',
      'modern-office': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&h=1080&fit=crop',
      'home-office': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop'
    };

    return backgrounds[backgroundType] || backgrounds['office-environment'];
  }

  // Generate avatar with specific emotions
  async generateAvatarWithEmotion(text, audioUrl, emotion, avatarId = null) {
    try {
      const avatarConfig = avatarConfigs[avatarId || this.defaultAvatar];
      
      // Add emotion-specific parameters
      const emotionConfig = this.getEmotionConfig(emotion);
      
      const videoData = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarConfig.id,
              input_audio: audioUrl,
              emotion: emotionConfig
            },
            background: {
              type: "image",
              image_url: this.getBackgroundUrl(avatarConfig.background)
            },
            voice: {
              type: "text",
              input_text: text,
              voice_id: avatarConfig.voiceId
            }
          }
        ],
        test: false,
        aspect_ratio: "16:9",
        quality: "high",
        output_format: "mp4"
      };

      const response = await axios.post(
        `${this.baseUrl}/video/generate`,
        videoData,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.video_url) {
        logger.avatar(`Generated emotional avatar video (${emotion}) for ${avatarConfig.name}`);
        return response.data.data.video_url;
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'generateAvatarWithEmotion', 
        emotion, 
        avatarId 
      });
      
      // Fallback to regular video generation
      return this.generateAvatarVideo(text, audioUrl, avatarId);
    }
  }

  // Get emotion configuration
  getEmotionConfig(emotion) {
    const emotions = {
      'happy': { intensity: 0.7, type: 'positive' },
      'neutral': { intensity: 0.5, type: 'neutral' },
      'concerned': { intensity: 0.6, type: 'negative' },
      'excited': { intensity: 0.8, type: 'positive' },
      'thoughtful': { intensity: 0.6, type: 'neutral' }
    };

    return emotions[emotion] || emotions['neutral'];
  }

  // Generate avatar with gestures
  async generateAvatarWithGestures(text, audioUrl, gesture, avatarId = null) {
    try {
      const avatarConfig = avatarConfigs[avatarId || this.defaultAvatar];
      
      const gestureConfig = this.getGestureConfig(gesture);
      
      const videoData = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarConfig.id,
              input_audio: audioUrl,
              gesture: gestureConfig
            },
            background: {
              type: "image",
              image_url: this.getBackgroundUrl(avatarConfig.background)
            },
            voice: {
              type: "text",
              input_text: text,
              voice_id: avatarConfig.voiceId
            }
          }
        ],
        test: false,
        aspect_ratio: "16:9",
        quality: "high",
        output_format: "mp4"
      };

      const response = await axios.post(
        `${this.baseUrl}/video/generate`,
        videoData,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.video_url) {
        logger.avatar(`Generated gestured avatar video (${gesture}) for ${avatarConfig.name}`);
        return response.data.data.video_url;
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'generateAvatarWithGestures', 
        gesture, 
        avatarId 
      });
      
      // Fallback to regular video generation
      return this.generateAvatarVideo(text, audioUrl, avatarId);
    }
  }

  // Get gesture configuration
  getGestureConfig(gesture) {
    const gestures = {
      'nodding': { type: 'head', intensity: 0.7 },
      'thinking': { type: 'hand', intensity: 0.6 },
      'pointing': { type: 'hand', intensity: 0.8 },
      'listening': { type: 'head', intensity: 0.5 },
      'emphasizing': { type: 'hand', intensity: 0.9 }
    };

    return gestures[gesture] || gestures['listening'];
  }

  // Get available avatars
  getAvailableAvatars() {
    return Object.keys(avatarConfigs).map(id => ({
      id,
      ...avatarConfigs[id]
    }));
  }

  // Validate avatar ID
  isValidAvatar(avatarId) {
    return avatarConfigs.hasOwnProperty(avatarId);
  }

  // Get avatar configuration
  getAvatarConfig(avatarId) {
    return avatarConfigs[avatarId] || avatarConfigs[this.defaultAvatar];
  }

  // Generate avatar preview (thumbnail)
  async generateAvatarPreview(avatarId = null) {
    try {
      const avatarConfig = avatarConfigs[avatarId || this.defaultAvatar];
      
      const previewData = {
        avatar_id: avatarConfig.id,
        background: {
          type: "image",
          image_url: this.getBackgroundUrl(avatarConfig.background)
        },
        aspect_ratio: "16:9",
        quality: "medium"
      };

      const response = await axios.post(
        `${this.baseUrl}/avatar/preview`,
        previewData,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.preview_url) {
        return response.data.data.preview_url;
      }

    } catch (error) {
      logger.errorWithContext(error, { 
        method: 'generateAvatarPreview', 
        avatarId 
      });
      
      // Return default preview image
      return `https://demo-avatars.heygen.com/${avatarConfig.id}-preview.jpg`;
    }
  }

  // Health check for avatar service
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        timeout: 5000
      });

      return {
        status: 'healthy',
        response: response.data
      };
    } catch (error) {
      logger.errorWithContext(error, { method: 'healthCheck' });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new AvatarService();