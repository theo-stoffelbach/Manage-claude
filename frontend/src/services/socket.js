import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Create Socket.IO instance with autoConnect: false
// We'll connect manually after authentication
const socket = io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Socket event listeners for debugging
socket.on('connect', () => {
  console.log('🔌 Connected to backend:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from backend:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

export default socket;
