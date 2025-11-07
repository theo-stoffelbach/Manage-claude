#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Check if Claude CLI is installed and if user is logged in
 * This script checks without launching Claude interactively
 */
function checkClaudeStatus() {
  // Step 1: Check if Claude is installed
  try {
    execSync('which claude', { stdio: 'pipe' });
    console.log('\x1b[32m✅ Claude is installed\x1b[0m');
    console.log('CLAUDE_INSTALLED'); // Marker for frontend
  } catch (error) {
    console.log('\x1b[31m❌ Claude is NOT installed\x1b[0m');
    console.log('\x1b[90m   Install it with: npm install -g @anthropic-ai/claude-code\x1b[0m');
    console.log('CLAUDE_NOT_INSTALLED'); // Marker for frontend
    return;
  }

  // Step 2: Check if user is logged in
  // We use 'claude whoami' with a timeout to avoid hanging
  try {
    const result = execSync('claude whoami 2>/dev/null', {
      stdio: 'pipe',
      timeout: 3000, // 3 second timeout
      encoding: 'utf-8'
    });

    if (result && result.trim()) {
      console.log('\x1b[32m✅ You are logged in to Claude\x1b[0m');
      console.log(`\x1b[90m   User: ${result.trim()}\x1b[0m`);
      console.log('CLAUDE_LOGGED_IN'); // Marker for frontend
    } else {
      console.log('\x1b[33m⚠️  Claude is installed but you are NOT logged in\x1b[0m');
      console.log('\x1b[90m   Run "claude auth login" to log in\x1b[0m');
      console.log('CLAUDE_NOT_LOGGED_IN'); // Marker for frontend
    }
  } catch (error) {
    console.log('\x1b[33m⚠️  Claude is installed but you are NOT logged in\x1b[0m');
    console.log('\x1b[90m   Run "claude auth login" to log in\x1b[0m');
    console.log('CLAUDE_NOT_LOGGED_IN'); // Marker for frontend
  }
}

// Run the check
checkClaudeStatus();
