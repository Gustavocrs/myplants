FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper process management
RUN apk add --no-cache dumb-init

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Use npm ci for deterministic installations
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapi -u 1001
RUN chown -R nodeapi:nodejs /app
USER nodeapi

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]