# 👤 Creating Users

## Quick Start (Recommended)

### 🖥️ From NAS Terminal (Easy Way)

```bash
# Navigate to project directory
cd /volume1/Docker_data/claude-manager-test

# Run the script
./create-user.sh
```

The script will ask you for:
- Username
- Email
- Password (with masked input)

### 🐳 Using Docker Command (Alternative)

```bash
docker exec terminal_backend node src/scripts/createUserCLI.js <username> <email> <password>
```

### Example

```bash
docker exec terminal_backend node src/scripts/createUserCLI.js john john@example.com MyPass123
```

## Password Requirements

Your password MUST contain:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)

## Interactive Mode (Alternative)

For interactive user creation with password masking:

```bash
docker exec -it terminal_backend node src/scripts/createUser.js
```

This will prompt you for each field interactively.

## Verification

After creating a user, test the login at:
**http://localhost:3005**

---

**Note**: Registration via the web interface is disabled for security. Only administrators with Docker access can create accounts.
