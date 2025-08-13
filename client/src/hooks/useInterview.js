import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useInterview = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startInterview = useCallback(async (candidateInfo, interviewType = 'mixed', avatarId = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/interview/start', {
        candidateInfo,
        interviewType,
        avatarId
      });

      if (response.data.success) {
        setInterview(response.data.data);
        toast.success('Interview started successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to start interview');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start interview';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (interviewId, message, type = 'text') => {
    try {
      setError(null);

      const response = await axios.post('/api/interview/respond', {
        interviewId,
        message,
        type
      });

      if (response.data.success) {
        // Update interview state with new message
        setInterview(prev => ({
          ...prev,
          conversationHistory: [
            ...(prev?.conversationHistory || []),
            {
              sender: 'candidate',
              message,
              timestamp: new Date().toISOString(),
              type
            }
          ]
        }));
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const endInterview = useCallback(async (interviewId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`/api/interview/${interviewId}/end`);

      if (response.data.success) {
        setInterview(response.data.data);
        toast.success('Interview ended successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to end interview');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to end interview';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInterview = useCallback(async (interviewId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/interview/${interviewId}`);

      if (response.data.success) {
        setInterview(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get interview');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get interview';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearInterview = useCallback(() => {
    setInterview(null);
    setError(null);
  }, []);

  return {
    interview,
    loading,
    error,
    startInterview,
    sendMessage,
    endInterview,
    getInterview,
    clearInterview
  };
};

export default useInterview;