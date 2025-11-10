# 🖥️ Terminal Access Guide

## What You Can Access

When you connect to the terminal via the web interface, you have access to:

### 📁 Full NAS Access

```
/volume1/Docker_data/               ← You start here
├── claude-manager-test/            ← This project
│   ├── backend/
│   ├── frontend/
│   ├── create-user.sh
│   └── docker-compose.yml
├── Scrum-Clicker/                  ← Your other projects
├── portefolio/
├── nginx-proxy/
├── Plex/
├── QBittorrent/
└── ... (all your Docker projects)
```

### ✅ You Can

- Navigate to any directory: `cd ../Scrum-Clicker`
- Edit files: `nano backend/src/server.js`
- Run commands: `npm install`, `git pull`, `docker ps`
- Create/delete files: `touch newfile.txt`, `rm oldfile.txt`
- View environment files: `cat .env`
- Execute Docker commands: `docker compose up -d`

### ⚠️ Be Careful

Since you have full access, you can also:
- Delete important files
- Modify other projects
- Access sensitive `.env` files
- Execute potentially dangerous commands

## 🔒 Security Best Practices

### For Administrators

1. **Only create accounts for trusted users**
   - They will have access to ALL your Docker projects
   - They can read ALL your .env files
   - They can execute ANY command

2. **Regular audits**
   - Check command history regularly
   - Review file modifications
   - Monitor unusual activity

3. **Backup your data**
   - Keep regular backups of important projects
   - Store backups separately from NAS

### For Users

1. **Be careful with commands**
   - Double-check before running `rm -rf`
   - Don't modify files you don't own
   - Ask before making changes to shared projects

2. **Respect privacy**
   - Don't read other projects' .env files
   - Don't access sensitive data
   - Stay in your designated project area

3. **Log out when done**
   - Always log out after finishing work
   - Don't leave terminal sessions open

## 📊 Command History

All commands executed in the terminal are saved in the database for audit purposes.

Administrators can review command history:

```bash
docker exec -it terminal_postgres psql -U terminal_user -d terminal_app

# View recent commands
SELECT u.username, ch.command, ch.executed_at
FROM command_history ch
JOIN users u ON ch.user_id = u.id
ORDER BY ch.executed_at DESC
LIMIT 50;
```

## 🚫 What You CANNOT Access

The terminal is isolated within the Docker container, so you **cannot** access:
- `/volume1/homes` - User home directories
- `/volume1/media` - Media files (unless mounted)
- System-level NAS configuration
- Other volumes not mounted in the container

---

**Remember**: With great power comes great responsibility! Use the terminal wisely and respect the shared environment.
