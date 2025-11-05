const fs = require('fs');
const path = require('path');

/**
 * Claude Code Service
 * Manages launching and interacting with Claude Code CLI in a pseudo-terminal
 */

/**
 * Check if a directory exists
 * @param {string} dirPath - Directory path to check
 * @returns {boolean} - True if directory exists
 */
function directoryExists(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Validate project path for security
 * @param {string} projectPath - Project path to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateProjectPath(projectPath) {
  // Check for dangerous patterns
  if (projectPath.includes('..')) {
    return { valid: false, error: 'Path cannot contain ".."' };
  }

  // Must be absolute path
  if (!path.isAbsolute(projectPath)) {
    return { valid: false, error: 'Path must be absolute' };
  }

  // Check if directory exists
  if (!directoryExists(projectPath)) {
    return { valid: false, error: 'Directory does not exist' };
  }

  return { valid: true };
}

/**
 * Launch Claude Code in a pseudo-terminal
 * @param {Object} ptyProcess - node-pty terminal instance
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<void>}
 */
async function launchClaude(ptyProcess, projectPath) {
  return new Promise((resolve, reject) => {
    // Validate project path
    const validation = validateProjectPath(projectPath);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    // Navigate to project directory
    ptyProcess.write(`cd ${projectPath}\r`);

    // Wait a moment for cd to complete
    setTimeout(() => {
      // Attempt to launch Claude Code
      // Note: This assumes Claude CLI is installed globally
      // Command: claude (or npx @anthropic-ai/claude-code)
      ptyProcess.write('claude\r');

      console.log(`✅ Claude Code launched in: ${projectPath}`);
      resolve();
    }, 1000);
  });
}

/**
 * Detect Claude Code actions in terminal output
 * This is a simple pattern matcher for Claude's output
 * @param {string} output - Terminal output to analyze
 * @returns {Object|null} - Detected action or null
 */
function detectClaudeAction(output) {
  const patterns = [
    { regex: /Creating file:?\s+(.+)/, type: 'file_create' },
    { regex: /Modifying file:?\s+(.+)/, type: 'file_modify' },
    { regex: /Reading file:?\s+(.+)/, type: 'file_read' },
    { regex: /Deleting file:?\s+(.+)/, type: 'file_delete' },
    { regex: /Running command:?\s+(.+)/, type: 'command_run' },
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        target: match[1]?.trim(),
        timestamp: new Date()
      };
    }
  }

  return null;
}

/**
 * Check if Claude Code is installed
 * @param {Object} ptyProcess - node-pty terminal instance
 * @returns {Promise<boolean>}
 */
async function isClaudeInstalled(ptyProcess) {
  return new Promise((resolve) => {
    let output = '';

    const dataHandler = (data) => {
      output += data;
    };

    ptyProcess.onData(dataHandler);

    // Check Claude version
    ptyProcess.write('claude --version\r');

    setTimeout(() => {
      ptyProcess.off('data', dataHandler);

      // If output contains version number or 'claude', it's installed
      const installed = output.includes('claude') && !output.includes('command not found');
      resolve(installed);
    }, 2000);
  });
}

module.exports = {
  launchClaude,
  validateProjectPath,
  detectClaudeAction,
  isClaudeInstalled,
  directoryExists
};
