#!/bin/bash

##############################################
# User Creation Script for Claude Terminal  #
# Can be run from NAS terminal or anywhere  #
##############################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Claude Terminal - User Creation Tool ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Check if running from the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found!${NC}"
    echo "Please install Docker or run this script on a system with Docker."
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q terminal_backend; then
    echo -e "${RED}❌ Backend container 'terminal_backend' is not running!${NC}"
    echo "Please start the application with: docker compose up -d"
    exit 1
fi

# Get user input
echo -e "${GREEN}Please provide user information:${NC}\n"

# Username
while true; do
    read -p "Username (3-20 chars, alphanumeric): " USERNAME
    if [[ -z "$USERNAME" ]]; then
        echo -e "${RED}❌ Username cannot be empty${NC}"
        continue
    fi
    if [[ ${#USERNAME} -lt 3 || ${#USERNAME} -gt 20 ]]; then
        echo -e "${RED}❌ Username must be 3-20 characters${NC}"
        continue
    fi
    if [[ ! "$USERNAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        echo -e "${RED}❌ Username can only contain letters, numbers, underscore and dash${NC}"
        continue
    fi
    break
done

# Email
while true; do
    read -p "Email: " EMAIL
    if [[ -z "$EMAIL" ]]; then
        echo -e "${RED}❌ Email cannot be empty${NC}"
        continue
    fi
    if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${RED}❌ Invalid email format${NC}"
        continue
    fi
    break
done

# Password
while true; do
    read -s -p "Password (min 8 chars, must include: uppercase, lowercase, number): " PASSWORD
    echo
    if [[ -z "$PASSWORD" ]]; then
        echo -e "${RED}❌ Password cannot be empty${NC}"
        continue
    fi
    if [[ ${#PASSWORD} -lt 8 ]]; then
        echo -e "${RED}❌ Password must be at least 8 characters${NC}"
        continue
    fi
    if [[ ! "$PASSWORD" =~ [A-Z] ]]; then
        echo -e "${RED}❌ Password must contain at least one uppercase letter${NC}"
        continue
    fi
    if [[ ! "$PASSWORD" =~ [a-z] ]]; then
        echo -e "${RED}❌ Password must contain at least one lowercase letter${NC}"
        continue
    fi
    if [[ ! "$PASSWORD" =~ [0-9] ]]; then
        echo -e "${RED}❌ Password must contain at least one number${NC}"
        continue
    fi

    # Confirm password
    read -s -p "Confirm password: " PASSWORD_CONFIRM
    echo
    if [[ "$PASSWORD" != "$PASSWORD_CONFIRM" ]]; then
        echo -e "${RED}❌ Passwords do not match!${NC}"
        continue
    fi
    break
done

# Create user
echo -e "\n${YELLOW}⏳ Creating user...${NC}\n"

OUTPUT=$(docker exec terminal_backend node src/scripts/createUserCLI.js "$USERNAME" "$EMAIL" "$PASSWORD" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ User created successfully!${NC}\n"
    echo "$OUTPUT" | grep -A 5 "User created successfully"
    echo -e "\n${GREEN}You can now login at:${NC} ${BLUE}http://localhost:3005${NC}\n"
else
    echo -e "${RED}❌ Failed to create user:${NC}\n"
    echo "$OUTPUT" | grep "Error:"
    exit 1
fi
