# 🔐 Security Guidelines

## ⚠️ CRITICAL SECURITY NOTICE

### Terminal Access Scope

**This application provides access to your NAS filesystem** (`/volume1/Docker_data`).

Users with terminal access can:
- ✅ Navigate all projects in `/volume1/Docker_data`
- ✅ Edit files in any Docker project
- ✅ Execute commands (npm, docker, git, etc.)
- ✅ Create/delete files and directories

**⚠️ WARNING**: Users can potentially access sensitive data in other projects!

## User Management

### Why Public Registration is Disabled

**Public registration has been DISABLED for security reasons.**

This application provides access to a real terminal with full filesystem access. Allowing public registration would be a critical security vulnerability that could allow:
- Unauthorized access to your entire NAS Docker_data folder
- Execution of malicious commands on your NAS
- Data theft or destruction across all projects
- System compromise
- Access to sensitive configuration files (.env, credentials, etc.)

### Creating User Accounts

Only administrators can create user accounts using the secure CLI tool.

#### Method 1: NAS Terminal Script (Easiest) ⭐

```bash
# From NAS terminal, navigate to project
cd /volume1/Docker_data/claude-manager-test

# Run the interactive script
./create-user.sh
```

This is the **recommended method** for NAS users. The script will:
- Validate all inputs interactively
- Mask password input for security
- Verify the backend container is running
- Provide clear error messages

#### Method 2: Direct Docker Command

```bash
# One-line command with arguments
docker exec terminal_backend node src/scripts/createUserCLI.js <username> <email> <password>

# Example
docker exec terminal_backend node src/scripts/createUserCLI.js john john@example.com MyPass123
```

#### Method 3: Interactive Docker Mode

```bash
# Interactive mode with password masking
docker exec -it terminal_backend node src/scripts/createUser.js
```

### User Creation Process

The script will interactively prompt you for:

1. **Username** (3-20 characters, alphanumeric + underscore/dash)
2. **Email** (valid email format, must be unique)
3. **Password** (minimum 8 characters with requirements)
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

Example session:
```
🔐 === Secure User Creation Tool ===

This tool allows administrators to securely create user accounts.
Public registration is disabled for security reasons.

Username (3-20 chars, alphanumeric): john_doe
Email: john@example.com
Password (min 8 chars, must include: uppercase, lowercase, number): ********
Confirm password: ********

⏳ Creating user...

✅ User created successfully!
   ID: 1
   Username: john_doe
   Email: john@example.com
   Created: 2025-11-06 20:30:15
```

## Password Requirements

For maximum security, passwords must:
- Be at least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)
- Recommended: Include special characters (!@#$%^&*)

## Security Best Practices

### For Administrators

1. **Limit User Access**: Only create accounts for trusted users
2. **Strong Passwords**: Enforce strong password policies
3. **Regular Audits**: Periodically review user accounts
4. **Monitor Activity**: Check terminal session logs regularly
5. **Update Regularly**: Keep the application and dependencies updated

### For Users

1. **Protect Your Credentials**: Never share your username/password
2. **Use Strong Passwords**: Follow password requirements strictly
3. **Log Out**: Always log out when finished
4. **Report Issues**: Immediately report any suspicious activity

## Additional Security Measures

### Environment Variables

Ensure these environment variables are set with strong, unique values:

```env
SESSION_SECRET=<strong-random-string-minimum-32-characters>
JWT_SECRET=<strong-random-string-minimum-32-characters>
```

Generate strong secrets:
```bash
# Linux/Mac
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Security

- PostgreSQL is only accessible within the Docker network
- Credentials are stored as bcrypt hashes (10 rounds)
- Sessions are stored server-side in PostgreSQL

### Network Security

In production:
- Use HTTPS/WSS (TLS/SSL certificates)
- Configure firewall rules
- Use reverse proxy (nginx/traefik)
- Restrict access by IP if possible

## Threat Model

### What This Protects Against

✅ Unauthorized account creation
✅ Weak passwords
✅ Public exposure of registration endpoints
✅ Password rainbow table attacks (bcrypt hashing)
✅ Session hijacking (httpOnly cookies)

### What You Still Need to Secure

⚠️ Physical/network access to the server
⚠️ Compromised administrator credentials
⚠️ Social engineering attacks
⚠️ Unpatched system vulnerabilities
⚠️ Malicious insiders with legitimate access

## Incident Response

If you suspect a security breach:

1. **Immediate Actions**:
   ```bash
   # Stop all containers
   docker compose down

   # Review logs
   docker compose logs backend | grep -i "error\|unauthorized\|failed"

   # Check database for suspicious users
   docker exec -it terminal_postgres psql -U terminal_user -d terminal_app
   # SELECT * FROM users ORDER BY created_at DESC;
   ```

2. **Investigation**:
   - Review terminal session logs
   - Check command history table
   - Audit user creation times
   - Review system logs

3. **Recovery**:
   - Change all passwords
   - Rotate SESSION_SECRET and JWT_SECRET
   - Remove compromised accounts
   - Apply security patches

## Contact

For security vulnerabilities, contact your system administrator immediately.

**Never disclose security issues publicly until they are resolved.**

---

**Last Updated**: 2025-11-06
**Security Level**: High - Terminal Access Application
