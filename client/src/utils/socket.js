import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to socket server...');
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      if (userId) {
        this.socket.emit('user:join', userId);
        console.log('👤 User joined:', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }
    console.error('❌ Socket not connected, cannot emit:', event);
    return false;
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Message methods
  sendMessage(receiverId, message) {
    console.log('📤 Sending message via socket:', { receiverId, message });
    return this.emit('message:send', { receiverId, message });
  }

  onMessageReceive(callback) {
    this.on('message:receive', callback);
  }

  // Typing methods
  startTyping(receiverId, senderId) {
    return this.emit('typing:start', { receiverId, senderId });
  }

  stopTyping(receiverId, senderId) {
    return this.emit('typing:stop', { receiverId, senderId });
  }

  onTypingStart(callback) {
    this.on('typing:show', callback);
  }

  onTypingStop(callback) {
    this.on('typing:hide', callback);
  }

  // User status methods
  onUserOnline(callback) {
    this.on('user:online', callback);
  }

  onUserOffline(callback) {
    this.on('user:offline', callback);
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((_, event) => {
        this.off(event);
      });
    }
  }
}

export default new SocketService();
