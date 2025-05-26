# Builder stage
FROM node:alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Final stage
FROM node:alpine

WORKDIR /usr/src/app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy artifacts from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/index.js ./index.js
COPY --from=builder /usr/src/app/package.json ./package.json

# Set environment variables
ENV PORT=80
ENV USER_SERVICE_URL=""
ENV PROJECT_SERVICE_URL=""
ENV PROMPT_SERVICE_URL=""
ENV AGENT_MANAGEMENT_SERVICE_URL=""

# Switch to non-root user
USER appuser

EXPOSE 80

CMD ["node", "index.js"]
