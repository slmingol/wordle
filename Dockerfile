# Multi-stage Dockerfile for Wordle+
# Supports both development and production builds

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Build
FROM base AS builder
ENV NODE_ENV=production
RUN npm install --production=false
COPY . .
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
