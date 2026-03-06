# Deployment Guide

This guide covers deployment options, configuration, and best practices for deploying Wordle+.

## Table of Contents

- [Quick Start](#quick-start)
- [Build Configuration](#build-configuration)
- [Deployment Platforms](#deployment-platforms)
  - [GitHub Pages](#github-pages)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
  - [CloudFlare Pages](#cloudflare-pages)
  - [Custom Server](#custom-server)
- [Environment Variables](#environment-variables)
- [PWA Deployment](#pwa-deployment)
- [Performance Optimization](#performance-optimization)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

Build for production:

```bash
npm run build
```

Preview locally:

```bash
npm run preview
```

The `dist/` folder contains your production-ready application.

## Build Configuration

### vite.config.js

```javascript
export default defineConfig({
  base: '/wordle/',  // Set to your repo name for GitHub Pages
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', 'svelte/store', 'svelte/transition'],
          words: ['./src/words_5.ts'],
        },
      },
    },
  },
  plugins: [
    svelte(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),
  ],
});
```

### Build Output

After running `npm run build`, you'll get:

```
dist/
├── index.html                    # Entry point
├── index-v1.5.2.js              # Main JS bundle (25KB Brotli)
├── index-v1.5.2.css             # Main styles
├── assets/
│   ├── vendor-[hash].js         # Framework (5KB Brotli)
│   ├── words-[hash].js          # Words list (21KB Brotli)
│   └── *.js / *.css             # Lazy chunks
├── img/                          # Images
├── manifest.json                 # PWA manifest
└── sw.js                         # Service worker
```

**Bundle Size (Brotli compression):**
- Total: ~51KB (gzipped: ~65KB)
- Main bundle: 25KB
- Vendor chunk: 5KB
- Words chunk: 21KB

## Deployment Platforms

### GitHub Pages

**Recommended for:** Free hosting, simple setup, automatic deploys

#### Automated Deployment (GitHub Actions)

1. **Configure base path in vite.config.js:**

```javascript
export default defineConfig({
  base: '/wordle/',  // Replace with your repo name
});
```

2. **Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

4. **Push to main branch:**

```bash
git push origin main
```

Your site will be live at: `https://[username].github.io/[repo-name]/`

#### Manual Deployment

```bash
npm run build
npx gh-pages -d dist
```

---

### Netlify

**Recommended for:** Easy setup, automatic deploys, preview branches

#### Setup

1. **Create `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

2. **Set base path in vite.config.js:**

```javascript
export default defineConfig({
  base: '/',  // Root path for Netlify
});
```

3. **Deploy via Netlify CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Or connect your GitHub repo in Netlify dashboard for automatic deploys.

**Live URL:** `https://[site-name].netlify.app`

---

### Vercel

**Recommended for:** Serverless functions, edge network, analytics

#### Setup

1. **Create `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*\\.(?:js|css))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

2. **Deploy via Vercel CLI:**

```bash
npm install -g vercel
vercel login
vercel
```

Or connect via Vercel dashboard.

**Live URL:** `https://[project-name].vercel.app`

---

### CloudFlare Pages

**Recommended for:** Global CDN, DDoS protection, free SSL

#### Setup

1. **Create `_headers` in `public/`:**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/sw.js
  Cache-Control: public, max-age=0, must-revalidate

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

2. **Create `_redirects` in `public/`:**

```
/*    /index.html   200
```

3. **Deploy:**
   - Connect GitHub repo in CloudFlare Pages dashboard
   - Build command: `npm run build`
   - Build output: `dist`

**Live URL:** `https://[project-name].pages.dev`

---

### Custom Server

**Recommended for:** Full control, existing infrastructure

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/wordle/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Brotli (if nginx-module-brotli installed)
    brotli on;
    brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker - no cache
    location = /sw.js {
        expires off;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # SSL (if using certbot)
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/wordle/dist

    <Directory /var/www/wordle/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Security headers
        Header always set X-Frame-Options "DENY"
        Header always set X-Content-Type-Options "nosniff"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
        Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>

    # Service worker - no cache
    <Files "sw.js">
        Header set Cache-Control "public, max-age=0, must-revalidate"
    </Files>

    # Enable compression
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</VirtualHost>
```

---

## Environment Variables

### .env Files

Create `.env.production` for production-specific variables:

```bash
# API endpoints
VITE_API_URL=https://api.yourdomain.com

# Analytics
VITE_GA_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=yourdomain.com

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_SHARING=true

# Build info
VITE_APP_VERSION=1.5.2
VITE_BUILD_TIME=2024-01-15T10:30:00Z
```

### Access in Code

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_APP_VERSION;
```

### Security Notes

- Never commit `.env` files
- Use platform-specific environment variables for secrets
- Prefix all variables with `VITE_` to expose them to client

---

## PWA Deployment

### Service Worker

Ensure `sw.js` is properly configured:

```javascript
const CACHE_VERSION = 'v1.5.2';  // Auto-injected by build
const CACHE_NAME = `wordle-cache-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/manifest.json',
  // Add critical assets
];
```

### manifest.json

Update URLs for your domain:

```json
{
  "name": "Wordle+",
  "short_name": "Wordle+",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#121213",
  "theme_color": "#538d4e",
  "icons": [
    {
      "src": "/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### HTTPS Requirement

PWAs require HTTPS. All major platforms (GitHub Pages, Netlify, Vercel) provide free SSL.

For custom servers, use Let's Encrypt:

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Performance Optimization

### Pre-Deployment Checklist

- [ ] Run production build: `npm run build`
- [ ] Check bundle sizes: Look for warnings in build output
- [ ] Test locally: `npm run preview`
- [ ] Lighthouse audit: 90+ scores
- [ ] Test on mobile devices
- [ ] Verify PWA installability
- [ ] Test offline functionality
- [ ] Check console for errors
- [ ] Validate accessibility (0 warnings)

### Lighthouse Targets

Run Lighthouse audit:

```bash
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

**Target Scores:**
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: ✓ Installable

### Bundle Analysis

Analyze bundle composition:

```bash
npm run build -- --mode analyze
```

Or use [rollup-plugin-visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer):

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true, brotliSize: true })
  ]
});
```

---

## Post-Deployment

### Verify Deployment

1. **Check homepage loads:**
   ```bash
   curl -I https://yourdomain.com
   ```

2. **Verify routing:**
   Navigate to `/daily`, `/hourly`, `/infinite`

3. **Test PWA:**
   - Open DevTools → Application → Manifest
   - Check "Service Workers" tab
   - Verify offline mode (DevTools → Network → Offline)

4. **Check compression:**
   ```bash
   curl -H "Accept-Encoding: br" -I https://yourdomain.com/index.js
   # Should return Content-Encoding: br
   ```

5. **Security headers:**
   ```bash
   curl -I https://yourdomain.com | grep -E "X-Frame|X-Content|Referrer"
   ```

### Monitoring

Set up monitoring for:

- **Uptime:** [UptimeRobot](https://uptimerobot.com/), [Pingdom](https://www.pingdom.com/)
- **Performance:** [Web Vitals](https://web.dev/vitals/), Google Analytics
- **Errors:** Browser console, error tracking service
- **Usage:** Analytics dashboard

### Analytics Setup

If using Google Analytics:

```html
<!-- public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

For privacy-focused analytics, use [Plausible](https://plausible.io/) or [Fathom](https://usefathom.com/).

---

## Troubleshooting

### Common Issues

#### 404 on Refresh

**Problem:** SPA routes return 404 when refreshing

**Solution:** Configure server to serve `index.html` for all routes

- **Netlify:** `_redirects` file
- **Vercel:** `vercel.json` rewrites
- **Nginx:** `try_files` directive

#### Service Worker Not Updating

**Problem:** Old service worker cached

**Solution:**
1. Increment version in `scripts/inject-version.js`
2. Clear browser cache
3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Check DevTools → Application → Service Workers → Update

#### Blank Page After Deploy

**Problem:** White screen, no errors

**Possible causes:**
1. Wrong `base` path in vite.config.js
2. Missing assets
3. JavaScript error (check console)

**Solution:**
```javascript
// vite.config.js
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/wordle/' : '/',
});
```

#### Bundle Too Large

**Problem:** Main bundle > 100KB

**Solution:**
1. Check bundle analysis
2. Lazy load heavy components
3. Remove unused dependencies
4. Enable tree-shaking

```javascript
// Lazy load
const Settings = await lazyLoad(() => import('./Settings.svelte'));
```

#### Compression Not Working

**Problem:** Files not compressed

**Solution:**
1. Verify server supports Brotli/Gzip
2. Check `Accept-Encoding` header
3. Verify `.br` and `.gz` files exist in dist/
4. Configure server to serve pre-compressed files

---

## Deployment Comparison

| Platform | Cost | Setup | Auto-Deploy | SSL | CDN | Best For |
|----------|------|-------|-------------|-----|-----|----------|
| **GitHub Pages** | Free | Easy | ✓ | ✓ | ✓ | Open source projects |
| **Netlify** | Free tier | Easy | ✓ | ✓ | ✓ | General use, forms |
| **Vercel** | Free tier | Easy | ✓ | ✓ | ✓ | Serverless functions |
| **CloudFlare Pages** | Free | Medium | ✓ | ✓ | ✓ | DDoS protection |
| **Custom Server** | Varies | Hard | Manual | DIY | Optional | Full control |

---

## Continuous Integration

### GitHub Actions Example

Complete CI/CD pipeline:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - uses: actions/deploy-pages@v4
```

---

For more information, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow
- [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md) - Browser support
