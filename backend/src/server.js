const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool, initializeDatabase } = require('./config/database');
const { setupTerminalHandlers } = require('./socket/terminal');
const { setupAuthHandlers } = require('./socket/auth');
const { setupSessionHandlers } = require('./socket/session');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS for frontend
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Session configuration with PostgreSQL store
const sessionMiddleware = session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.use(sessionMiddleware);

// Share session middleware with Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Terminal Claude Code Backend is running' });
});

// Serve test HTML pages
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../../test-terminal.html'));
});

app.get('/test-auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../../test-auth.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Setup authentication handlers (login, register, logout)
  setupAuthHandlers(socket, io);

  // Setup session handlers (create, list, load, rename, delete)
  setupSessionHandlers(socket);

  // Setup terminal handlers (creates PTY and handles terminal events)
  // Note: Terminal is created immediately on connection for testing
  // In production, terminal should be created only when a session is loaded
  setupTerminalHandlers(socket);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database schema
    await initializeDatabase();

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    pool.end();
    process.exit(0);
  });
});

startServer();

module.exports = { app, io, server };
