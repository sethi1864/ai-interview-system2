import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Settings,
  MessageSquare,
  Volume2,
  VolumeX,
  Send,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import AvatarDisplay from './AvatarDisplay';
import ChatInterface from './ChatInterface';
import ScoreDisplay from './ScoreDisplay';
import SessionStats from './SessionStats';
import LoadingSpinner from './LoadingSpinner';

// Hooks
import { useInterview } from '../hooks/useInterview';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudio } from '../hooks/useAudio';

const InterviewRoom = ({ isDemo = false }) => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: false,
    microphone: false
  });
  const [mediaStream, setMediaStream] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioOff, setIsAudioOff] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Custom hooks
  const { interview, startInterview, sendMessage, endInterview } = useInterview();
  const { socket, isConnected, connect, disconnect } = useWebSocket();
  const { startRecording, stopRecording, isRecording, audioBlob } = useAudio();

  // Initialize interview
  useEffect(() => {
    const initInterview = async () => {
      try {
        setIsConnecting(true);
        
        // Request media permissions
        await requestMediaPermissions();
        
        // Connect to WebSocket
        await connect();
        
        // Join interview room
        if (socket && isConnected) {
          socket.emit('join-interview', {
            interviewId: interviewId || 'demo-interview',
            candidateInfo: {
              name: 'Demo Candidate',
              email: 'demo@example.com',
              position: 'Software Engineer'
            }
          });
        }
        
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to initialize interview:', error);
        setConnectionStatus('error');
        toast.error('Failed to start interview. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    };

    initInterview();

    return () => {
      // Cleanup
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      disconnect();
    };
  }, [interviewId, socket, isConnected]);

  // Handle WebSocket events
  useEffect(() => {
    if (!socket) return;

    socket.on('interview-started', (data) => {
      console.log('Interview started:', data);
      toast.success('Interview started successfully!');
    });

    socket.on('ai-response', (data) => {
      console.log('AI response:', data);
      setIsTyping(false);
      // Handle AI response (play audio, show avatar video)
    });

    socket.on('ai-typing', (data) => {
      setIsTyping(data.isTyping);
    });

    socket.on('score-update', (data) => {
      console.log('Score update:', data);
      // Update score display
    });

    socket.on('interview-ended', (data) => {
      console.log('Interview ended:', data);
      toast.success('Interview completed!');
      navigate('/results');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      toast.error('Connection lost. Please refresh the page.');
    });

    return () => {
      socket.off('interview-started');
      socket.off('ai-response');
      socket.off('ai-typing');
      socket.off('score-update');
      socket.off('interview-ended');
      socket.off('error');
      socket.off('disconnect');
    };
  }, [socket, navigate]);

  // Request camera and microphone permissions
  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setMediaStream(stream);
      setMediaPermissions({
        camera: true,
        microphone: true
      });

      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      toast.success('Camera and microphone access granted');
    } catch (error) {
      console.error('Media permission error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Please allow camera and microphone access to continue');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found');
      } else {
        toast.error('Failed to access camera and microphone');
      }
      
      setMediaPermissions({
        camera: false,
        microphone: false
      });
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        if (audioTrack.enabled) {
          toast.success('Microphone enabled');
        } else {
          toast.success('Microphone muted');
        }
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        
        if (videoTrack.enabled) {
          toast.success('Camera enabled');
        } else {
          toast.success('Camera disabled');
        }
      }
    }
  };

  // Toggle audio playback
  const toggleAudio = () => {
    setIsAudioOff(!isAudioOff);
    if (audioRef.current) {
      audioRef.current.muted = !isAudioOff;
    }
  };

  // Send text message
  const sendTextMessage = () => {
    if (!currentMessage.trim()) return;

    if (socket && isConnected) {
      socket.emit('candidate-response', {
        interviewId: interviewId || 'demo-interview',
        message: currentMessage,
        timestamp: new Date().toISOString()
      });

      setCurrentMessage('');
      setIsTyping(true);
    }
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    try {
      if (isRecording) {
        const blob = await stopRecording();
        
        if (socket && isConnected) {
          socket.emit('audio-input', {
            interviewId: interviewId || 'demo-interview',
            audioBlob: blob
          });
        }
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Voice message error:', error);
      toast.error('Failed to record voice message');
    }
  };

  // End interview
  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview?')) {
      if (socket && isConnected) {
        socket.emit('end-interview', {
          interviewId: interviewId || 'demo-interview'
        });
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Connecting to Interview...
          </h2>
          <p className="text-secondary-600">
            Please wait while we set up your interview session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-secondary-900">
                AI Interview
              </h1>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-success-500' :
                  connectionStatus === 'connecting' ? 'bg-warning-500' :
                  'bg-error-500'
                }`} />
                <span className="text-sm text-secondary-600 capitalize">
                  {connectionStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Media Permissions Status */}
              <div className="flex items-center space-x-1">
                {mediaPermissions.camera ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-error-500" />
                )}
                <span className="text-xs text-secondary-500">Camera</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {mediaPermissions.microphone ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-error-500" />
                )}
                <span className="text-xs text-secondary-500">Mic</span>
              </div>

              {/* Control Buttons */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="btn btn-ghost btn-sm"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="btn btn-ghost btn-sm"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={handleEndInterview}
                className="btn btn-error btn-sm"
              >
                <PhoneOff className="w-4 h-4" />
                End
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Video */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Your Video
              </h3>
              
              <div className="relative aspect-video bg-secondary-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {!mediaPermissions.camera && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary-900/50">
                    <div className="text-center text-white">
                      <VideoOff className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Camera access required</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center space-x-2 mt-4">
                <button
                  onClick={toggleMicrophone}
                  className={`btn btn-sm ${isMuted ? 'btn-error' : 'btn-success'}`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleCamera}
                  className={`btn btn-sm ${isVideoOff ? 'btn-error' : 'btn-success'}`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`btn btn-sm ${isAudioOff ? 'btn-error' : 'btn-success'}`}
                >
                  {isAudioOff ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Center Column - AI Avatar */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                AI Interviewer
              </h3>
              
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
                <AvatarDisplay 
                  isTyping={isTyping}
                  isDemo={isDemo}
                />
              </div>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-3 bg-white rounded-lg border border-secondary-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span className="text-sm text-secondary-600">
                        AI is typing...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Section - Chat & Controls */}
        <div className="mt-6">
          <div className="card p-4">
            <div className="flex items-center space-x-4">
              {/* Text Input */}
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="textarea pr-12 resize-none"
                    rows="2"
                  />
                  <button
                    onClick={sendTextMessage}
                    disabled={!currentMessage.trim()}
                    className="absolute right-2 bottom-2 btn btn-primary btn-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Voice Input */}
              <button
                onClick={sendVoiceMessage}
                className={`btn btn-lg ${isRecording ? 'btn-error' : 'btn-primary'}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Voice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50"
          >
            <ChatInterface 
              onClose={() => setShowChat(false)}
              isDemo={isDemo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Session Stats */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50"
          >
            <SessionStats 
              onClose={() => setShowStats(false)}
              isDemo={isDemo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Element for AI Responses */}
      <audio ref={audioRef} autoPlay />
    </div>
  );
};

export default InterviewRoom;