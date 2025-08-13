import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
axios.defaults.timeout = 30000;

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Interview API calls
export const startInterview = async (candidateInfo, interviewType = 'mixed', avatarId = null) => {
  try {
    const response = await axios.post('/api/interview/start', {
      candidateInfo,
      interviewType,
      avatarId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to start interview');
  }
};

export const sendInterviewResponse = async (interviewId, message, type = 'text') => {
  try {
    const response = await axios.post('/api/interview/respond', {
      interviewId,
      message,
      type
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send response');
  }
};

export const endInterview = async (interviewId) => {
  try {
    const response = await axios.post(`/api/interview/${interviewId}/end`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to end interview');
  }
};

export const getInterview = async (interviewId) => {
  try {
    const response = await axios.get(`/api/interview/${interviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get interview');
  }
};

// Avatar API calls
export const generateAvatar = async (text, audioUrl, avatarId = null) => {
  try {
    const response = await axios.post('/api/avatar/generate', {
      text,
      audioUrl,
      avatarId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate avatar');
  }
};

export const getAvatars = async () => {
  try {
    const response = await axios.get('/api/avatar/list');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get avatars');
  }
};

// Speech API calls
export const synthesizeSpeech = async (text, voiceId = null) => {
  try {
    const response = await axios.post('/api/speech/synthesize', {
      text,
      voiceId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to synthesize speech');
  }
};

export const recognizeSpeech = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await axios.post('/api/speech/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to recognize speech');
  }
};

export const getVoices = async () => {
  try {
    const response = await axios.get('/api/speech/voices');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get voices');
  }
};

// Analytics API calls
export const getAnalytics = async (filters = {}) => {
  try {
    const response = await axios.get('/api/analytics/overview', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get analytics');
  }
};

export const getInterviewStats = async () => {
  try {
    const response = await axios.get('/api/analytics/interviews');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get interview stats');
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Service unavailable');
  }
};

export default {
  startInterview,
  sendInterviewResponse,
  endInterview,
  getInterview,
  generateAvatar,
  getAvatars,
  synthesizeSpeech,
  recognizeSpeech,
  getVoices,
  getAnalytics,
  getInterviewStats,
  healthCheck
};