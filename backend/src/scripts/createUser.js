#!/usr/bin/env node

/**
 * Secure CLI script to create users
 * Usage: npm run create-user
 * Or: node src/scripts/createUser.js
 */

const readline = require('readline');
const User = require('../models/User');
const { pool, initializeDatabase } = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input (hidden for password)
 */
function question(prompt, hidden = false) {
  return new Promise((resolve) => {
    if (hidden) {
      const stdin = process.stdin;
      stdin.resume();
      stdin.setRawMode(true);

      process.stdout.write(prompt);
      let password = '';

      stdin.on('data', (char) => {
        char = char.toString('utf8');

        switch (char) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            stdin.setRawMode(false);
            stdin.pause();
            process.stdout.write('\n');
            resolve(password);
            break;
          case '\u0003': // Ctrl+C
            process.exit();
            break;
          case '\u007f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(prompt + '*'.repeat(password.length));
            }
            break;
          default:
            password += char;
            process.stdout.write('*');
            break;
        }
      });
    } else {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    }
  });
}

/**
 * Validate inputs
 */
function validateUsername(username) {
  if (!username || username.length < 3 || username.length > 20) {
    return 'Username must be 3-20 characters';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscore and dash';
  }
  return null;
}

function validateEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

/**
 * Main function
 */
async function createUser() {
  console.log('\n🔐 === Secure User Creation Tool ===\n');
  console.log('This tool allows administrators to securely create user accounts.');
  console.log('Public registration is disabled for security reasons.\n');

  try {
    // Initialize database
    await initializeDatabase();

    // Get username
    let username;
    while (true) {
      username = await question('Username (3-20 chars, alphanumeric): ');
      const usernameError = validateUsername(username);
      if (usernameError) {
        console.log(`❌ ${usernameError}`);
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        console.log(`❌ User '${username}' already exists!`);
        continue;
      }

      break;
    }

    // Get email
    let email;
    while (true) {
      email = await question('Email: ');
      const emailError = validateEmail(email);
      if (emailError) {
        console.log(`❌ ${emailError}`);
        continue;
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        console.log(`❌ Email '${email}' is already registered!`);
        continue;
      }

      break;
    }

    // Get password
    let password;
    while (true) {
      password = await question('Password (min 8 chars, must include: uppercase, lowercase, number): ', true);
      const passwordError = validatePassword(password);
      if (passwordError) {
        console.log(`❌ ${passwordError}`);
        continue;
      }

      const confirmPassword = await question('Confirm password: ', true);
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match!');
        continue;
      }

      break;
    }

    // Create user
    console.log('\n⏳ Creating user...');
    const user = await User.create(username, email, password);

    console.log('\n✅ User created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}\n`);

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
    process.exit(0);
  }
}

// Run the script
createUser();
