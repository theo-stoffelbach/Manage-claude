-- Terminal Claude Code Web - Database Schema

-- Table users: User accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table terminal_sessions: Terminal sessions for each user
CREATE TABLE IF NOT EXISTS terminal_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Session',
    project_path TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table command_history: Command history for each session
CREATE TABLE IF NOT EXISTS command_history (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES terminal_sessions(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    output TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Table claude_interactions: Claude Code interactions
CREATE TABLE IF NOT EXISTS claude_interactions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES terminal_sessions(id) ON DELETE CASCADE,
    prompt TEXT,
    files_modified JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table session: Express session storage (created by connect-pg-simple)
-- This table will be created automatically by the connect-pg-simple middleware

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_terminal_sessions_user_id ON terminal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_command_history_session_id ON command_history(session_id);
CREATE INDEX IF NOT EXISTS idx_claude_interactions_session_id ON claude_interactions(session_id);
