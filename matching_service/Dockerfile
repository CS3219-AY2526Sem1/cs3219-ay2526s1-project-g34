# AI Assistance Disclosure
# Tool: ChatGPT (GPT-5 Thinking), date: 2025-11-13
# Scope: Assisted in refining Dockerfile structure for Node.js (Yarn + Alpine) setup,
# improving layer order and ensuring reliable build behavior.
# Author review: All commands tested and verified by the author(s).

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
