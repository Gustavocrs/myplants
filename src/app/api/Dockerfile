FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY src/app/api/package*.json ./
RUN npm install --omit=dev
COPY src/app/api/ .
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapi -u 1001
RUN chown -R nodeapi:nodejs /app
USER nodeapi
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
