# Build stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .

# Serve stage
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /app/logs && chown -R app:app /app
USER app
EXPOSE 5000
CMD ["npm", "start"]
