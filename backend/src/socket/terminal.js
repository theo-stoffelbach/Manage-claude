const ptyService = require('../services/ptyService');

/**
 * Setup terminal-related Socket.IO event handlers
 * @param {Socket} socket - Socket.IO socket instance
 */
function setupTerminalHandlers(socket) {
  console.log('🖥️  Setting up terminal handlers for socket:', socket.id);

  // Create a new pseudo-terminal when client connects
  const ptyProcess = ptyService.createTerminal(socket.id);

  // Listen for data from the pseudo-terminal and send to client
  ptyProcess.onData((data) => {
    socket.emit('terminal:output', data);
  });

  // Listen for exit events
  ptyProcess.onExit(({ exitCode, signal }) => {
    console.log(`⚠️  Terminal exited for socket ${socket.id}, code: ${exitCode}, signal: ${signal}`);
    socket.emit('terminal:exit', { exitCode, signal });
    ptyService.killTerminal(socket.id);
  });

  // Emit terminal:ready event after a short delay
  setTimeout(() => {
    console.log(`✅ Terminal ready for socket ${socket.id}, emitting terminal:ready`);
    socket.emit('terminal:ready');
  }, 500); // Wait 500ms for terminal to be fully initialized

  // Handle input from client (user typing in terminal)
  socket.on('terminal:input', (data) => {
    console.log(`⌨️  Received terminal:input for socket ${socket.id}:`, data.substring(0, 50));
    ptyService.writeToTerminal(socket.id, data);
  });

  // Handle terminal resize
  socket.on('terminal:resize', ({ cols, rows }) => {
    if (cols && rows) {
      ptyService.resizeTerminal(socket.id, cols, rows);
    }
  });

  // Handle client disconnect - kill the terminal
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected, killing terminal:', socket.id);
    ptyService.killTerminal(socket.id);
  });
}

module.exports = { setupTerminalHandlers };
