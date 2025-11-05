# Backend Dockerfile
FROM node:18-alpine

# Install dependencies for node-pty (build-essential equivalent)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
