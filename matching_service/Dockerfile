# Simple, reliable build
FROM node:20-alpine
WORKDIR /app

# copy manifests first
COPY package.json yarn.lock ./

# Use Yarn, but install into node_modules (no PnP)
RUN corepack enable \
 && yarn config set nodeLinker node-modules \
 && yarn install --immutable

# copy the rest
COPY . .

EXPOSE 3004
CMD ["yarn", "dev"]
