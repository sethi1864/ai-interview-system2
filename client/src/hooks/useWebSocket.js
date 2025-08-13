import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback((url = 'http://localhost:3000') => {
    try {
      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      // Create new socket connection
      const newSocket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: maxReconnectAttempts
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
              connect(url);
            }, 2000);
          } else {
            setConnectionError('Max reconnection attempts reached');
            toast.error('Connection lost. Please refresh the page.');
          }
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect after error (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect(url);
          }, 3000);
        } else {
          toast.error('Failed to connect to server. Please check your connection.');
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Connection restored!');
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection error:', error);
        setConnectionError(error.message);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('WebSocket reconnection failed');
        setConnectionError('Failed to reconnect');
        toast.error('Connection failed. Please refresh the page.');
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError(error.message);
      throw error;
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
    }
    
    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
  }, [socket]);

  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: socket not connected');
      throw new Error('Socket not connected');
    }
  }, [socket, isConnected]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};

export default useWebSocket;