import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, MessageSquare, Mic, Video, TrendingUp, Users, Activity } from 'lucide-react';

const SessionStats = ({ onClose, isDemo = false }) => {
  const [stats, setStats] = useState({
    duration: 0,
    messages: 0,
    audioRecordings: 0,
    videoRecordings: 0,
    score: 0,
    topics: [],
    emotions: []
  });

  // Demo stats
  const demoStats = {
    duration: 1847, // 30 minutes 47 seconds
    messages: 12,
    audioRecordings: 3,
    videoRecordings: 1,
    score: 7.5,
    topics: [
      { name: 'Technical Skills', count: 5 },
      { name: 'Experience', count: 4 },
      { name: 'Problem Solving', count: 3 },
      { name: 'Communication', count: 2 }
    ],
    emotions: [
      { name: 'Confident', percentage: 65 },
      { name: 'Engaged', percentage: 25 },
      { name: 'Nervous', percentage: 10 }
    ]
  };

  useEffect(() => {
    if (isDemo) {
      setStats(demoStats);
    } else {
      // In real mode, this would fetch from the API
      setStats({
        duration: 0,
        messages: 0,
        audioRecordings: 0,
        videoRecordings: 0,
        score: 0,
        topics: [],
        emotions: []
      });
    }
  }, [isDemo]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-900">Session Statistics</h3>
        <div className="flex items-center space-x-2">
          {isDemo && (
            <span className="badge badge-warning text-xs">Demo</span>
          )}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-4 text-center"
          >
            <Clock className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary-900">
              {formatDuration(stats.duration)}
            </div>
            <div className="text-sm text-secondary-600">Duration</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-4 text-center"
          >
            <MessageSquare className="w-6 h-6 text-success-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary-900">
              {stats.messages}
            </div>
            <div className="text-sm text-secondary-600">Messages</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-4 text-center"
          >
            <Mic className="w-6 h-6 text-warning-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary-900">
              {stats.audioRecordings}
            </div>
            <div className="text-sm text-secondary-600">Audio</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-4 text-center"
          >
            <Video className="w-6 h-6 text-error-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary-900">
              {stats.videoRecordings}
            </div>
            <div className="text-sm text-secondary-600">Video</div>
          </motion.div>
        </div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-secondary-900">Overall Score</h4>
            <TrendingUp className="w-5 h-5 text-success-500" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-primary-600">
              {stats.score.toFixed(1)}
            </div>
            <div className="flex-1">
              <div className="w-full bg-secondary-200 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(stats.score / 10) * 100}%` }}
                />
              </div>
              <div className="text-sm text-secondary-600 mt-1">
                out of 10 points
              </div>
            </div>
          </div>
        </motion.div>

        {/* Topics Discussed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-4"
        >
          <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Topics Discussed
          </h4>
          <div className="space-y-2">
            {stats.topics.map((topic, index) => (
              <div key={topic.name} className="flex items-center justify-between">
                <span className="text-sm text-secondary-700">{topic.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(topic.count / Math.max(...stats.topics.map(t => t.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-secondary-500 w-4 text-right">
                    {topic.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emotional Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-4"
        >
          <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Emotional Analysis
          </h4>
          <div className="space-y-3">
            {stats.emotions.map((emotion, index) => (
              <div key={emotion.name} className="flex items-center justify-between">
                <span className="text-sm text-secondary-700">{emotion.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${emotion.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-secondary-500 w-8 text-right">
                    {emotion.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Session Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-4"
        >
          <h4 className="font-semibold text-secondary-900 mb-3">Session Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-sm text-secondary-600">Session started</span>
              <span className="text-xs text-secondary-500 ml-auto">0:00</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-secondary-600">First question asked</span>
              <span className="text-xs text-secondary-500 ml-auto">0:30</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <span className="text-sm text-secondary-600">Technical discussion</span>
              <span className="text-xs text-secondary-500 ml-auto">5:15</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-error-500 rounded-full"></div>
              <span className="text-sm text-secondary-600">Session ended</span>
              <span className="text-xs text-secondary-500 ml-auto">{formatTime(stats.duration)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SessionStats;