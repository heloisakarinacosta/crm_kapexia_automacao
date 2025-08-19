# Backend Dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies first, in a separate layer to leverage Docker cache
COPY package*.json ./

RUN npm install

# Copy application code
COPY . .

# Expose port and define command
EXPOSE 3001
CMD ["npm", "start"]
