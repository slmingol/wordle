# Docker Configuration

This directory contains all Docker-related files for the Wordle+ project.

## Files

- **Dockerfile** - Multi-stage build (development, builder, production)
- **docker-compose.yml** - Full stack with multiple profiles (dev, prod, prod-prebuilt, prod-configured)
- **docker-compose.simple.yml** - Simple setup using pre-built GHCR image
- **nginx.conf** - Nginx configuration for production
- **DOCKER.md** - Detailed Docker documentation

## Quick Start

### Using Pre-built Image (Recommended)

```bash
# From project root or docker/ directory
docker compose -f docker/docker-compose.simple.yml up -d
```

Access the game at http://localhost:5173

### Development Mode

```bash
# From project root or docker/ directory
docker compose -f docker/docker-compose.yml --profile dev up
```

### Production Build from Source

```bash
# From project root or docker/ directory
docker compose -f docker/docker-compose.yml --profile prod up -d
```

### Production with Pre-built Image

```bash
# From project root or docker/ directory
docker compose -f docker/docker-compose.yml --profile prod-prebuilt up -d
```

## Profiles

- **dev** - Development environment with hot reload (port 5173)
- **prod** - Production build from source (port 8080)
- **prod-prebuilt** - Production using GHCR image (port 8080)
- **prod-configured** - Production with custom environment variables

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `VITE_ANALYTICS_ENABLED` - Enable analytics (default: false)
- `VITE_ANALYTICS_PROVIDER` - Analytics provider (default: plausible)
- `VITE_PERFORMANCE_MONITORING` - Enable performance monitoring (default: false)

See [DOCKER.md](DOCKER.md) for detailed documentation.
