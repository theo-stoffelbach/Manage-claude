import { io } from 'socket.io-client';

// Automatically detect backend URL based on current window location
// This allows the app to work whether accessed via localhost, IP, or domain
const getBackendUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // Use the same hostname as the frontend, but port 3105
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3105`;
};

const BACKEND_URL = getBackendUrl();

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
