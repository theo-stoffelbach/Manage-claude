const pty = require('node-pty');
const os = require('os');

// Map to store active terminals by socket ID
const activeTerminals = new Map();

/**
 * Create a new pseudo-terminal instance
 * @param {string} socketId - Unique socket ID
 * @param {string} initialDir - Initial working directory
 * @returns {Object} - PTY instance
 */
function createTerminal(socketId, initialDir = '/volume1/Docker_data/claude-manager-test') {
  // Determine the shell based on OS
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  // Create pseudo-terminal with node-pty
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: initialDir,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      HOME: '/volume1/Docker_data',
      // Add common paths for better compatibility
      PATH: process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    }
  });

  console.log(`✅ Created terminal for socket ${socketId}, PID: ${ptyProcess.pid}, CWD: ${initialDir}`);

  // Store the terminal instance
  activeTerminals.set(socketId, ptyProcess);

  return ptyProcess;
}

/**
 * Get an existing terminal by socket ID
 * @param {string} socketId - Socket ID
 * @returns {Object|null} - PTY instance or null
 */
function getTerminal(socketId) {
  return activeTerminals.get(socketId) || null;
}

/**
 * Write data to a terminal
 * @param {string} socketId - Socket ID
 * @param {string} data - Data to write
 */
function writeToTerminal(socketId, data) {
  const terminal = getTerminal(socketId);
  if (terminal) {
    terminal.write(data);
  } else {
    console.error(`❌ Terminal not found for socket ${socketId}`);
  }
}

/**
 * Resize a terminal
 * @param {string} socketId - Socket ID
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 */
function resizeTerminal(socketId, cols, rows) {
  const terminal = getTerminal(socketId);
  if (terminal) {
    try {
      terminal.resize(cols, rows);
      console.log(`📐 Resized terminal ${socketId} to ${cols}x${rows}`);
    } catch (error) {
      console.error(`❌ Error resizing terminal ${socketId}:`, error);
    }
  } else {
    console.error(`❌ Terminal not found for socket ${socketId}`);
  }
}

/**
 * Kill a terminal and remove it from the map
 * @param {string} socketId - Socket ID
 */
function killTerminal(socketId) {
  const terminal = getTerminal(socketId);
  if (terminal) {
    try {
      terminal.kill();
      activeTerminals.delete(socketId);
      console.log(`🔪 Killed terminal for socket ${socketId}`);
    } catch (error) {
      console.error(`❌ Error killing terminal ${socketId}:`, error);
    }
  }
}

/**
 * Get all active terminals count
 * @returns {number} - Number of active terminals
 */
function getActiveTerminalsCount() {
  return activeTerminals.size;
}

module.exports = {
  createTerminal,
  getTerminal,
  writeToTerminal,
  resizeTerminal,
  killTerminal,
  getActiveTerminalsCount
};
