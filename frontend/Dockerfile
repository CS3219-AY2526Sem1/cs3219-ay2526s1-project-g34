# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Use nginx to serve the built app
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy nginx configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]