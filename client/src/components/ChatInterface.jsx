import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Mic, MicOff, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatInterface = ({ onClose, isDemo = false }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  // Demo messages
  const demoMessages = [
    {
      id: 1,
      sender: 'ai',
      message: 'Hello! I\'m Sarah, and I\'ll be conducting your interview today. Thank you for joining us.',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: 2,
      sender: 'candidate',
      message: 'Thank you for having me. I\'m excited to be here.',
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    },
    {
      id: 3,
      sender: 'ai',
      message: 'Great! Let\'s start with a bit about your background. Can you tell me about your experience in software development?',
      timestamp: new Date(Date.now() - 180000),
      type: 'text'
    },
    {
      id: 4,
      sender: 'candidate',
      message: 'I have about 5 years of experience in full-stack development, primarily working with React, Node.js, and Python. I\'ve worked on several large-scale applications and enjoy solving complex problems.',
      timestamp: new Date(Date.now() - 120000),
      type: 'text'
    },
    {
      id: 5,
      sender: 'ai',
      message: 'That sounds impressive! Can you walk me through a challenging project you worked on recently?',
      timestamp: new Date(Date.now() - 60000),
      type: 'text'
    }
  ];

  useEffect(() => {
    if (isDemo) {
      setMessages(demoMessages);
    }
  }, [isDemo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'candidate',
      message: currentMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');

    // Simulate AI response in demo mode
    if (isDemo) {
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          message: 'That\'s very interesting! Can you elaborate on that?',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success('Recording started');
    } else {
      toast.success('Recording stopped');
    }
  };

  const exportChat = () => {
    const chatText = messages
      .map(msg => `${msg.sender === 'ai' ? 'Interviewer' : 'You'}: ${msg.message}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Chat exported successfully');
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      toast.success('Chat cleared');
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-900">Interview Chat</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportChat}
            className="btn btn-ghost btn-sm"
            title="Export Chat"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearChat}
            className="btn btn-ghost btn-sm text-error-500 hover:text-error-600"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-secondary-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'candidate'
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'candidate' ? 'text-primary-100' : 'text-secondary-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="textarea resize-none"
              rows="2"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={toggleRecording}
              className={`btn btn-sm ${isRecording ? 'btn-error' : 'btn-ghost'}`}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={sendMessage}
              disabled={!currentMessage.trim()}
              className="btn btn-primary btn-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 flex items-center space-x-2 text-error-500"
          >
            <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;