# Collaboration Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install && npm install uuid@8.3.2

# Copy source code
COPY . .

EXPOSE 3003

CMD ["node", "server.js"]