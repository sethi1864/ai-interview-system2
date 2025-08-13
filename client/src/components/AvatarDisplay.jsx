import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AvatarDisplay = ({ isTyping = false, isDemo = false, avatarId = 'sarah-professional-hr' }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Demo mode placeholder videos
  const demoVideos = {
    'sarah-professional-hr': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'john-technical-lead': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    'priya-senior-hr': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    'david-executive': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4'
  };

  // Avatar configurations
  const avatarConfigs = {
    'sarah-professional-hr': {
      name: 'Sarah',
      role: 'HR Professional',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100'
    },
    'john-technical-lead': {
      name: 'John',
      role: 'Technical Lead',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      background: 'bg-gradient-to-br from-green-50 to-emerald-100'
    },
    'priya-senior-hr': {
      name: 'Priya',
      role: 'Senior HR Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      background: 'bg-gradient-to-br from-purple-50 to-violet-100'
    },
    'david-executive': {
      name: 'David',
      role: 'Executive',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      background: 'bg-gradient-to-br from-gray-50 to-slate-100'
    }
  };

  const currentAvatar = avatarConfigs[avatarId] || avatarConfigs['sarah-professional-hr'];

  useEffect(() => {
    // Simulate loading avatar video
    const loadAvatar = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In demo mode, use placeholder videos
        if (isDemo) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
          setCurrentVideo(demoVideos[avatarId] || demoVideos['sarah-professional-hr']);
        } else {
          // In production, this would fetch from the avatar service
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
          setCurrentVideo(demoVideos[avatarId] || demoVideos['sarah-professional-hr']);
        }
      } catch (err) {
        console.error('Failed to load avatar:', err);
        setError('Failed to load avatar video');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatar();
  }, [avatarId, isDemo]);

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${currentAvatar.background}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
          <p className="text-secondary-600 font-medium">Loading {currentAvatar.name}...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${currentAvatar.background}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-12 h-12 text-error-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-error-600 font-medium mb-2">Avatar Unavailable</p>
          <p className="text-secondary-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${currentAvatar.background}`}>
      {/* Avatar Video */}
      {currentVideo && (
        <video
          src={currentVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={() => setError('Failed to load video')}
        />
      )}

      {/* Fallback Avatar Image */}
      {!currentVideo && (
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <img
              src={currentAvatar.image}
              alt={currentAvatar.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
            />
            <h3 className="text-xl font-semibold text-secondary-900 mb-1">
              {currentAvatar.name}
            </h3>
            <p className="text-secondary-600">{currentAvatar.role}</p>
          </motion.div>
        </div>
      )}

      {/* Typing Indicator Overlay */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <span className="text-sm font-medium text-secondary-700">
              {currentAvatar.name} is thinking...
            </span>
          </div>
        </motion.div>
      )}

      {/* Avatar Info Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-secondary-700">
            {currentAvatar.name} - {currentAvatar.role}
          </span>
        </div>
      </div>

      {/* Demo Mode Badge */}
      {isDemo && (
        <div className="absolute top-4 right-4 bg-warning-500 text-white px-2 py-1 rounded text-xs font-medium">
          DEMO MODE
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;