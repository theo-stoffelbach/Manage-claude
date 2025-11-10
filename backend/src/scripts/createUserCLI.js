#!/usr/bin/env node

/**
 * Simple CLI script to create users (non-interactive for Docker)
 * Usage: node src/scripts/createUserCLI.js <username> <email> <password>
 */

const User = require('../models/User');
const { pool, initializeDatabase } = require('../config/database');

async function createUser() {
  const [username, email, password] = process.argv.slice(2);

  if (!username || !email || !password) {
    console.error('❌ Usage: npm run create-user-cli <username> <email> <password>');
    console.error('\nExample:');
    console.error('  npm run create-user-cli john john@example.com MyPassword123');
    console.error('\nPassword requirements:');
    console.error('  - Minimum 8 characters');
    console.error('  - At least one uppercase letter');
    console.error('  - At least one lowercase letter');
    console.error('  - At least one number');
    process.exit(1);
  }

  try {
    console.log('\n🔐 Creating user account...\n');

    // Initialize database
    await initializeDatabase();

    // Validate username
    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be 3-20 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, underscore and dash');
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new Error(`User '${username}' already exists!`);
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      throw new Error(`Email '${email}' is already registered!`);
    }

    // Validate password
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Create user
    const user = await User.create(username, email, password);

    console.log('✅ User created successfully!\n');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createUser();
