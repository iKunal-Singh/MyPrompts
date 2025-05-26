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
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json

# Set environment variables
ENV PORT=80
ENV MONGODB_URI=""
ENV API_ENCRYPTION_KEY=""

# Switch to non-root user
USER appuser

EXPOSE 80

CMD ["npm", "start"]
