const logger = require('../server/utils/logger');
const Interview = require('../server/models/Interview');
const aiService = require('../server/services/aiService');
const avatarService = require('../server/services/avatarService');
const speechService = require('../server/services/speechService');

const socketConfig = (io) => {
  // Store active interviews
  const activeInterviews = new Map();

  io.on('connection', (socket) => {
    logger.info(`🔌 New client connected: ${socket.id}`);

    // Join interview room
    socket.on('join-interview', async (data) => {
      try {
        const { interviewId, candidateInfo } = data;
        
        socket.join(interviewId);
        activeInterviews.set(interviewId, {
          socketId: socket.id,
          candidateInfo,
          startTime: new Date(),
          status: 'active'
        });

        logger.info(`👤 Candidate joined interview: ${interviewId}`);

        // Send welcome message
        const welcomeMessage = await aiService.generateWelcomeMessage(candidateInfo);
        const audioUrl = await speechService.synthesizeSpeech(welcomeMessage);
        const avatarVideo = await avatarService.generateAvatarVideo(welcomeMessage, audioUrl);

        socket.emit('interview-started', {
          message: welcomeMessage,
          audioUrl,
          avatarVideo,
          interviewId
        });

        // Update interview in database
        await Interview.findOneAndUpdate(
          { interviewId },
          {
            $push: {
              conversationHistory: {
                speaker: 'ai',
                message: welcomeMessage,
                timestamp: new Date(),
                audioUrl,
                videoUrl: avatarVideo
              }
            }
          }
        );

      } catch (error) {
        logger.error('Error joining interview:', error);
        socket.emit('error', { message: 'Failed to start interview' });
      }
    });

    // Handle candidate response
    socket.on('candidate-response', async (data) => {
      try {
        const { interviewId, message, audioBlob, timestamp } = data;
        
        logger.info(`💬 Candidate response in ${interviewId}: ${message.substring(0, 50)}...`);

        // Save candidate response to database
        await Interview.findOneAndUpdate(
          { interviewId },
          {
            $push: {
              conversationHistory: {
                speaker: 'candidate',
                message,
                timestamp: new Date(timestamp),
                audioUrl: audioBlob ? await speechService.saveAudio(audioBlob) : null
              }
            }
          }
        );

        // Generate AI response
        const aiResponse = await aiService.generateResponse(message, interviewId);
        const audioUrl = await speechService.synthesizeSpeech(aiResponse);
        const avatarVideo = await avatarService.generateAvatarVideo(aiResponse, audioUrl);

        // Send AI response back
        socket.emit('ai-response', {
          message: aiResponse,
          audioUrl,
          avatarVideo,
          timestamp: new Date()
        });

        // Save AI response to database
        await Interview.findOneAndUpdate(
          { interviewId },
          {
            $push: {
              conversationHistory: {
                speaker: 'ai',
                message: aiResponse,
                timestamp: new Date(),
                audioUrl,
                videoUrl: avatarVideo
              }
            }
          }
        );

        // Calculate and emit real-time score
        const score = await aiService.calculateResponseScore(message, interviewId);
        socket.emit('score-update', { score, timestamp: new Date() });

      } catch (error) {
        logger.error('Error processing candidate response:', error);
        socket.emit('error', { message: 'Failed to process response' });
      }
    });

    // Handle audio input
    socket.on('audio-input', async (data) => {
      try {
        const { interviewId, audioBlob } = data;
        
        // Convert speech to text
        const transcript = await speechService.recognizeSpeech(audioBlob);
        
        socket.emit('transcript', { 
          text: transcript,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Error processing audio input:', error);
        socket.emit('error', { message: 'Failed to process audio' });
      }
    });

    // Handle interview end
    socket.on('end-interview', async (data) => {
      try {
        const { interviewId } = data;
        
        logger.info(`🏁 Interview ended: ${interviewId}`);

        // Generate closing message
        const closingMessage = await aiService.generateClosingMessage(interviewId);
        const audioUrl = await speechService.synthesizeSpeech(closingMessage);
        const avatarVideo = await avatarService.generateAvatarVideo(closingMessage, audioUrl);

        socket.emit('interview-ended', {
          message: closingMessage,
          audioUrl,
          avatarVideo,
          finalScore: await aiService.getFinalScore(interviewId)
        });

        // Update interview status
        await Interview.findOneAndUpdate(
          { interviewId },
          {
            status: 'completed',
            endTime: new Date(),
            duration: Date.now() - activeInterviews.get(interviewId)?.startTime
          }
        );

        activeInterviews.delete(interviewId);
        socket.leave(interviewId);

      } catch (error) {
        logger.error('Error ending interview:', error);
        socket.emit('error', { message: 'Failed to end interview' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(data.interviewId).emit('ai-typing', { isTyping: true });
    });

    socket.on('typing-stop', (data) => {
      socket.to(data.interviewId).emit('ai-typing', { isTyping: false });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
      
      // Find and update any active interviews for this socket
      for (const [interviewId, interview] of activeInterviews.entries()) {
        if (interview.socketId === socket.id) {
          await Interview.findOneAndUpdate(
            { interviewId },
            { status: 'abandoned', endTime: new Date() }
          );
          activeInterviews.delete(interviewId);
          break;
        }
      }
    });
  });

  // Admin socket for monitoring
  io.of('/admin').on('connection', (socket) => {
    logger.info(`👨‍💼 Admin connected: ${socket.id}`);

    socket.on('join-admin', () => {
      socket.join('admin-room');
      socket.emit('active-interviews', Array.from(activeInterviews.entries()));
    });

    socket.on('intervene-interview', async (data) => {
      const { interviewId, adminMessage } = data;
      io.to(interviewId).emit('admin-intervention', {
        message: adminMessage,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      logger.info(`👨‍💼 Admin disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = socketConfig;