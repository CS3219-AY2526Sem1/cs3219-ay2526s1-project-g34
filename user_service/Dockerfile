# User Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install openssl for key generation
RUN apk add --no-cache openssl

# Generate JWT keys at build time
RUN mkdir -p src/keys && \
    openssl genrsa -out src/keys/jwt-private.pem 2048 && \
    openssl rsa -in src/keys/jwt-private.pem -pubout -out src/keys/jwt-public.pem


EXPOSE 3001

CMD ["npm", "run", "dev"]