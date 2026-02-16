# Docker Deployment Guide

This guide covers running Wordle+ in Docker containers for both development and production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Production](#production)
- [Configuration](#configuration)
- [Docker Compose Profiles](#docker-compose-profiles)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Using Pre-built Images (Recommended)

Pre-built images are automatically published to GitHub Container Registry on every release.

```bash
# Pull and run the latest production image
docker run -p 8080:80 ghcr.io/slmingol/wordle:latest

# Or use docker-compose
docker-compose --profile prod-prebuilt up

# Access at http://localhost:8080
```

### Development Mode

```bash
# Start development server with hot reload
docker-compose --profile dev up

# Or build and run
docker-compose --profile dev up --build

# Access at http://localhost:5173
```

### Production Mode (Build from Source)

```bash
# Build and start production server
docker-compose --profile prod up --build

# Access at http://localhost:8080
```

## Development

### Using Docker Compose (Recommended)

```bash
# Start development environment
docker-compose --profile dev up

# Run in background
docker-compose --profile dev up -d

# View logs
docker-compose --profile dev logs -f

# Stop
docker-compose --profile dev down
```

### Using Docker Directly

```bash
# Build development image
docker build --target development -t wordle-dev .

# Run container
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules wordle-dev

# Access at http://localhost:5173
```

### Features

- ✅ Hot Module Replacement (HMR)
- ✅ Source maps
- ✅ Volume mounting for live code changes
- ✅ Node modules isolated in container
- ✅ Exposed on all interfaces (accessible from host)

## Production

### Using Docker Compose (Recommended)

```bash
# Build and start production server
docker-compose --profile prod up --build

# Run in background
docker-compose --profile prod up -d

# Stop
docker-compose --profile prod down
```

### Using Pre-built Image

```bash
# Pull latest image
docker pull ghcr.io/slmingol/wordle:latest

# Run container
docker run -p 8080:80 ghcr.io/slmingol/wordle:latest

# Or specific version
docker run -p 8080:80 ghcr.io/slmingol/wordle:2.0.1

# Access at http://localhost:8080
```

### Using Docker Directly (Build from Source)

```bash
# Build production image
docker build --target production -t wordle-prod .

# Run container
docker run -p 8080:80 wordle-prod

# Access at http://localhost:8080
```

### Features

- ✅ Multi-stage build (smaller image)
- ✅ Nginx web server
- ✅ Gzip compression
- ✅ Security headers
- ✅ SPA routing support
- ✅ Static asset caching
- ✅ Health check endpoint

### Image Sizes

- **Development**: ~500 MB (includes dev dependencies)
- **Production**: ~25 MB (Alpine Linux + Nginx + built assets)

## Configuration

### Environment Variables

Create `.env.production` for production configuration:

```bash
# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_SITE_ID=yourdomain.com

# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_METRICS_ENDPOINT=/api/metrics

# Error Tracking
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_PROVIDER=sentry
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Build Info
VITE_APP_VERSION=1.5.2
```

### Using Environment Files

```bash
# Production with environment file
docker-compose --profile prod-config up --build

# Or specify custom env file
docker-compose --env-file .env.custom --profile prod-config up
```

### Build Arguments

Pass environment variables at build time:

```bash
docker build --target production \
  --build-arg VITE_ANALYTICS_ENABLED=true \
  --build-arg VITE_ANALYTICS_PROVIDER=plausible \
  -t wordle-prod .
```

## Docker Compose Profiles

The `docker-compose.yml` includes four profiles:

### 1. Development Profile (`dev`)

- Hot reload enabled
- Volume mounting for live changes
- Runs on port 5173
- Analytics/monitoring disabled by default

```bash
docker-compose --profile dev up
```

### 2. Production Pre-built Profile (`prod-prebuilt`)

- Uses pre-built image from GitHub Container Registry
- No build step required
- Fastest deployment
- Runs on port 8080
- Automatically updated with each release

```bash
docker-compose --profile prod-prebuilt up
```

### 3. Production Build Profile (`prod`)

- Optimized production build from source
- Nginx web server
- Runs on port 8080
- Basic configuration

```bash
docker-compose --profile prod up --build
```

### 4. Production Configured Profile (`prod-config`)

- Production build with custom environment
- Loads from `.env.production`
- All monitoring features configurable

```bash
docker-compose --profile prod-config up --build
```

## Container Registry

Pre-built images are published to GitHub Container Registry (GHCR) on every push to main and on releases.

### Available Tags

```bash
# Latest version (main branch)
ghcr.io/slmingol/wordle:latest

# Specific version
ghcr.io/slmingol/wordle:2.0.1
ghcr.io/slmingol/wordle:2.0

# Branch-based
ghcr.io/slmingol/wordle:main

# Commit-based (for specific commits)
ghcr.io/slmingol/wordle:main-<commit-sha>
```

### Pulling Images

```bash
# Pull latest
docker pull ghcr.io/slmingol/wordle:latest

# Pull specific version
docker pull ghcr.io/slmingol/wordle:2.0.1

# Run pulled image
docker run -p 8080:80 ghcr.io/slmingol/wordle:latest
```

### Multi-Architecture Support

Images are built for multiple architectures:
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64/Apple Silicon)

Docker automatically pulls the correct architecture for your system.

## Customization

### Custom Port

```bash
# Development on different port
docker-compose --profile dev up -p 3000:5173

# Production on different port
docker run -p 80:80 wordle-prod
```

### Custom Nginx Configuration

Edit `nginx.conf` to customize:
- Cache headers
- Security headers
- Compression settings
- Routing rules

Then rebuild:

```bash
docker-compose --profile prod up --build
```

### Add Brotli Compression

1. Use nginx image with Brotli module:

```dockerfile
FROM fholzer/nginx-brotli:latest AS production
```

2. Uncomment Brotli lines in `nginx.conf`:

```nginx
brotli on;
brotli_static on;
brotli_types text/plain text/css application/json application/javascript ...;
```

### Volume Mounts

Development with custom mounts:

```yaml
volumes:
  - ./src:/app/src           # Only mount source
  - ./public:/app/public     # And public assets
  - /app/node_modules        # Exclude node_modules
```

## Multi-Container Setup

### With Backend API

```yaml
version: '3.8'

services:
  wordle-frontend:
    build:
      context: .
      target: production
    ports:
      - "80:80"
    depends_on:
      - api

  api:
    image: your-api-image
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://...

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wordle
      - POSTGRES_PASSWORD=secret
```

### With Reverse Proxy

```yaml
version: '3.8'

services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - wordle

  wordle:
    build:
      context: .
      target: production
    expose:
      - "80"
```

## Health Checks

### Docker Health Check

Add to `Dockerfile`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
docker-compose --profile dev up -p 3000:5173
```

### Permission Errors

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run as current user
docker run --user $(id -u):$(id -g) ...
```

### Module Not Found

```bash
# Rebuild without cache
docker-compose --profile dev build --no-cache

# Or clear volumes
docker-compose --profile dev down -v
```

### Hot Reload Not Working

1. Ensure volume is mounted correctly
2. Check Vite config has `--host 0.0.0.0`
3. Try rebuilding:

```bash
docker-compose --profile dev down
docker-compose --profile dev up --build
```

### Build Fails

```bash
# Check logs
docker-compose --profile prod logs

# Build with verbose output
docker build --progress=plain --no-cache .

# Verify node version
docker run --rm node:18-alpine node --version
```

### Container Won't Start

```bash
# Check container status
docker ps -a

# View container logs
docker logs wordle-dev

# Inspect container
docker inspect wordle-dev
```

### Size Optimization

If production image is too large:

```bash
# Check layer sizes
docker history wordle-prod

# Use dive for analysis
dive wordle-prod

# Multi-stage build should handle this
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build --target production -t wordle:latest .
      
      - name: Test image
        run: |
          docker run -d -p 8080:80 --name test wordle:latest
          sleep 5
          curl http://localhost:8080/health
          docker stop test
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push wordle:latest
```

### GitLab CI

```yaml
build:
  stage: build
  script:
    - docker build --target production -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml wordle

# Scale service
docker service scale wordle_wordle-prod=3
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordle
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wordle
  template:
    metadata:
      labels:
        app: wordle
    spec:
      containers:
      - name: wordle
        image: wordle:latest
        ports:
        - containerPort: 80
```

---

## Best Practices

1. **Use multi-stage builds** - Keeps production images small
2. **Pin base image versions** - Ensures reproducibility
3. **Use .dockerignore** - Reduces build context size
4. **Set resource limits** - Prevents container from consuming all resources
5. **Use health checks** - Enables container orchestration
6. **Scan for vulnerabilities** - Use `docker scan` or Trivy
7. **Use non-root user** - Enhance security (add to Dockerfile if needed)

---

For more information, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - General deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [Docker Documentation](https://docs.docker.com/)
