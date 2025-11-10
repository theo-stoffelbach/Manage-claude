#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Check if Claude CLI is installed
 * This script only checks if the 'claude' command exists
 */
function checkClaudeInstalled() {
  try {
    // Try to execute 'which claude' to check if it exists
    execSync('which claude', { stdio: 'pipe' });

    console.log('\x1b[32m✅ Claude is installed\x1b[0m');
    console.log('\x1b[90m   Run "claude" to launch Claude Code\x1b[0m');
    return true;
  } catch (error) {
    console.log('\x1b[31m❌ Claude is NOT installed\x1b[0m');
    console.log('\x1b[90m   Install it with: npm install -g @anthropic-ai/claude-code\x1b[0m');
    return false;
  }
}

// Run the check
checkClaudeInstalled();
