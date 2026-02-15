# Monitoring and Analytics Guide

This guide covers the monitoring, analytics, and error tracking features in Wordle+.

## Table of Contents

- [Overview](#overview)
- [Performance Monitoring](#performance-monitoring)
- [Analytics](#analytics)
- [Error Tracking](#error-tracking)
- [Configuration](#configuration)
- [Privacy & GDPR Compliance](#privacy--gdpr-compliance)
- [Integration Examples](#integration-examples)

## Overview

Wordle+ includes comprehensive monitoring capabilities:

- **Performance Monitoring**: Core Web Vitals and custom metrics
- **Analytics**: Privacy-friendly user behavior tracking
- **Error Tracking**: Production error monitoring and debugging

All features are:
- ✅ Privacy-first (GDPR compliant)
- ✅ Configurable via environment variables
- ✅ Respect Do Not Track (DNT)
- ✅ Require user consent where applicable
- ✅ Disabled by default (opt-in)

## Performance Monitoring

### Core Web Vitals

Automatically tracks Google's Core Web Vitals:

| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| **LCP** | Largest Contentful Paint | ≤2.5s | ≤4.0s | >4.0s |
| **FID** | First Input Delay | ≤100ms | ≤300ms | >300ms |
| **CLS** | Cumulative Layout Shift | ≤0.1 | ≤0.25 | >0.25 |
| **FCP** | First Contentful Paint | ≤1.8s | ≤3.0s | >3.0s |
| **TTFB** | Time to First Byte | ≤800ms | ≤1.8s | >1.8s |
| **INP** | Interaction to Next Paint | ≤200ms | ≤500ms | >500ms |

### Usage

```typescript
import { initializeMonitoring, onMetric, getMetrics } from './monitoring';

// Initialize monitoring
initializeMonitoring({
  enabled: true,
  onMetric: (metric) => {
    console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`);
    
    // Send to analytics
    trackEvent({
      name: 'performance_metric',
      properties: {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
      },
    });
  },
});

// Get all collected metrics
const metrics = getMetrics();
console.log(metrics.LCP, metrics.FID, metrics.CLS);
```

### Custom Performance Marks

Track custom performance metrics:

```typescript
import { trackMark, measureMarks } from './monitoring';

// Mark start
trackMark('game-start');

// ... game logic ...

// Mark end
trackMark('game-end');

// Measure duration
const duration = measureMarks('game-duration', 'game-start', 'game-end');
console.log(`Game took ${duration}ms`);
```

### Navigation & Resource Metrics

```typescript
import { getNavigationMetrics, getResourceMetrics } from './monitoring';

// Get page load metrics
const navMetrics = getNavigationMetrics();
console.log('DNS Lookup:', navMetrics.dnsLookup);
console.log('Page Load:', navMetrics.pageLoad);

// Get resource timing
const resources = getResourceMetrics();
resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});
```

## Analytics

### Supported Providers

- **Plausible** - Privacy-friendly, GDPR compliant, no cookies
- **Fathom** - Privacy-focused, simple analytics
- **Google Analytics** - Full-featured, requires consent

### Configuration

```typescript
import { initializeAnalytics, trackEvent, trackPageView } from './analytics';

// Initialize with Plausible
initializeAnalytics({
  enabled: true,
  provider: 'plausible',
  siteId: 'yourdomain.com',
  respectDNT: true,
  anonymizeIP: true,
});

// Track page view
trackPageView('/daily');

// Track custom event
trackEvent({
  name: 'game_won',
  properties: {
    mode: 'daily',
    guesses: 4,
  },
});
```

### Built-in Game Events

```typescript
import { GameEvents } from './analytics';

// Game lifecycle
GameEvents.GAME_STARTED('daily');
GameEvents.GAME_WON('daily', 4);
GameEvents.GAME_LOST('daily');
GameEvents.GAME_SHARED('daily');

// Settings
GameEvents.SETTINGS_CHANGED('hard-mode', true);
GameEvents.THEME_CHANGED('dark');

// Mode switching
GameEvents.MODE_SWITCHED('daily', 'infinite');
```

### User Consent

Analytics requires user consent (GDPR):

```typescript
import { grantConsent, revokeConsent, hasConsent } from './analytics';

// Check consent status
if (!hasConsent()) {
  showConsentBanner();
}

// User grants consent
grantConsent();

// User revokes consent
revokeConsent(); // Removes all tracking scripts
```

### Environment Variables

Set in `.env.production`:

```bash
# Plausible
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_SITE_ID=yourdomain.com

# Fathom
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=fathom
VITE_ANALYTICS_TRACKING_ID=XXXXXXXX

# Google Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=google
VITE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
```

## Error Tracking

### Supported Providers

- **Sentry** - Industry-standard error tracking
- **Custom** - Send to your own endpoint

### Sentry Setup

1. **Create Sentry project** at [sentry.io](https://sentry.io)

2. **Add Sentry SDK** to your HTML:

```html
<!-- public/index.html -->
<script
  src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

3. **Configure** in `.env.production`:

```bash
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_PROVIDER=sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Usage

```typescript
import { trackError, addBreadcrumb, setContext } from './errorTracking';

// Track an error
try {
  riskyOperation();
} catch (error) {
  trackError(error, {
    component: 'GameBoard',
    action: 'submitGuess',
  });
}

// Add breadcrumbs for debugging context
addBreadcrumb({
  category: 'user',
  message: 'User clicked submit button',
  level: 'info',
  data: { word: 'HELLO' },
});

// Set custom context
setContext('game', {
  mode: 'daily',
  round: 123,
  guesses: 3,
});
```

### Built-in Breadcrumb Helpers

```typescript
import { Breadcrumbs } from './errorTracking';

// Navigation
Breadcrumbs.navigation('/daily');

// User actions
Breadcrumbs.userAction('Clicked share button');

// API calls
Breadcrumbs.apiCall('/api/definition', 'GET', 200);

// State changes
Breadcrumbs.stateChange('gameState', 'Won game in 4 guesses');
```

### Error Filtering

Filter errors before sending:

```typescript
initializeErrorTracking({
  enabled: true,
  provider: 'sentry',
  dsn: 'your-dsn',
  beforeSend: (error) => {
    // Don't send benign ResizeObserver errors
    if (error.message.includes('ResizeObserver loop')) {
      return null;
    }
    
    // Don't send errors from browser extensions
    if (error.stack?.includes('chrome-extension://')) {
      return null;
    }
    
    return error;
  },
});
```

### Sample Rate

Reduce cost by sampling errors:

```typescript
initializeErrorTracking({
  enabled: true,
  provider: 'sentry',
  dsn: 'your-dsn',
  sampleRate: 0.5, // Send 50% of errors
});
```

## Configuration

### Default Configuration

See [src/monitoringConfig.ts](src/monitoringConfig.ts):

```typescript
import { mergeConfig } from './monitoringConfig';

// Load configuration (env vars override defaults)
const config = mergeConfig({
  performance: {
    enabled: true,
    reportInterval: 300000, // 5 minutes
  },
  analytics: {
    enabled: true,
    provider: 'plausible',
    respectDNT: true,
  },
  errorTracking: {
    enabled: true,
    provider: 'sentry',
    sampleRate: 1.0,
  },
});
```

### Environment Variables

All monitoring features can be configured via environment variables:

```bash
# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_METRICS_ENDPOINT=/api/metrics

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible|fathom|google
VITE_ANALYTICS_SITE_ID=yourdomain.com
VITE_ANALYTICS_TRACKING_ID=XXXXXXXX

# Error Tracking
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_PROVIDER=sentry|custom
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Build Info
VITE_APP_VERSION=1.5.2
```

### Runtime Configuration

Override at runtime:

```typescript
import { updateConfig } from './analytics';

// Update analytics config
updateConfig({
  enabled: true,
  provider: 'fathom',
  trackingId: 'XXXXXXXX',
});
```

## Privacy & GDPR Compliance

### Do Not Track (DNT)

Automatically respects browser DNT settings:

```typescript
initializeAnalytics({
  respectDNT: true, // Default: true
});
```

### IP Anonymization

Anonymizes user IP addresses:

```typescript
initializeAnalytics({
  anonymizeIP: true, // Default: true
});
```

### Cookie Consent

Requires explicit user consent:

```typescript
import { hasConsent, grantConsent } from './analytics';

// Show consent banner
if (!hasConsent()) {
  showConsentBanner();
}

// User accepts
function onAcceptCookies() {
  grantConsent(); // Initializes analytics
  hideConsentBanner();
}
```

### Data Minimization

Only essential data is collected:
- Page views (URL only, no query params with PII)
- Custom events (game actions, no personal data)
- Performance metrics (anonymous, aggregated)
- Errors (sanitized, no sensitive data)

### Privacy-Friendly Providers

Recommended analytics providers:

1. **Plausible** - No cookies, GDPR compliant, open source
2. **Fathom** - Privacy-focused, GDPR compliant, simple

Avoid Google Analytics unless you have proper consent management.

## Integration Examples

### Full Setup Example

```typescript
// main.ts
import { mergeConfig } from './monitoringConfig';
import { initializeMonitoring, onMetric } from './monitoring';
import { initializeAnalytics, GameEvents } from './analytics';
import { initializeErrorTracking } from './errorTracking';

// Load config from env vars
const config = mergeConfig();

// Initialize monitoring
initializeMonitoring({
  enabled: config.performance.enabled,
  onMetric: (metric) => {
    // Report to analytics
    if (metric.rating === 'poor') {
      trackEvent({
        name: 'poor_performance',
        properties: {
          metric: metric.name,
          value: metric.value,
        },
      });
    }
  },
});

// Initialize analytics (requires consent)
initializeAnalytics(config.analytics);

// Initialize error tracking
initializeErrorTracking(config.errorTracking);

// Track game events
GameEvents.GAME_STARTED('daily');
```

### Component Integration

```svelte
<!-- Game.svelte -->
<script lang="ts">
  import { GameEvents } from './analytics';
  import { trackMark, measureMarks } from './monitoring';
  import { addBreadcrumb } from './errorTracking';
  
  function startGame() {
    trackMark('game-start');
    GameEvents.GAME_STARTED(mode);
    addBreadcrumb({
      category: 'game',
      message: `Started ${mode} game`,
      level: 'info',
    });
  }
  
  function endGame(won: boolean, guesses: number) {
    trackMark('game-end');
    const duration = measureMarks('game-time', 'game-start', 'game-end');
    
    if (won) {
      GameEvents.GAME_WON(mode, guesses);
    } else {
      GameEvents.GAME_LOST(mode);
    }
    
    addBreadcrumb({
      category: 'game',
      message: `Finished game: ${won ? 'won' : 'lost'}`,
      level: 'info',
      data: { guesses, duration },
    });
  }
</script>
```

### Netlify/Vercel Deployment

Add environment variables in your hosting dashboard:

**Netlify:** Site settings → Environment variables
**Vercel:** Project settings → Environment Variables

```bash
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_SITE_ID=yourdomain.com
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_PROVIDER=sentry
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Best Practices

### Performance Monitoring

- ✅ Monitor Core Web Vitals in production
- ✅ Track custom metrics for critical user journeys
- ✅ Set performance budgets and alerts
- ✅ Use data to optimize bundle size and loading

### Analytics

- ✅ Use privacy-friendly providers (Plausible/Fathom)
- ✅ Respect user privacy (DNT, IP anonymization)
- ✅ Request consent before tracking
- ✅ Track meaningful events, not everything
- ✅ Review and clean up old events regularly

### Error Tracking

- ✅ Filter out noise (browser extensions, benign errors)
- ✅ Use sample rates in high-traffic apps
- ✅ Add context via breadcrumbs
- ✅ Set up alerts for critical errors
- ✅ Regularly review and fix tracked errors

---

For more information, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [API.md](API.md) - Utility function reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment configuration
