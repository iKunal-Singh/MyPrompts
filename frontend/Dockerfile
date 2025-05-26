# Build Stage
FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Serve Stage
FROM nginx:alpine

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Default CMD from nginx:alpine is ["nginx", "-g", "daemon off;"]
# No need to specify CMD unless overriding the default.
