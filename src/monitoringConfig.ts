/**
 * Monitoring and analytics configuration
 * Central configuration for all monitoring, analytics, and error tracking
 */

import type { AnalyticsConfig } from "./analytics";
import type { ErrorTrackingConfig } from "./errorTracking";

export interface MonitoringConfig {
	// Performance monitoring
	performance: {
		enabled: boolean;
		reportInterval?: number; // ms between reports
		reportEndpoint?: string; // API endpoint for metrics
	};

	// Analytics
	analytics: AnalyticsConfig;

	// Error tracking
	errorTracking: ErrorTrackingConfig;

	// Privacy settings
	privacy: {
		respectDNT: boolean; // Do Not Track
		anonymizeIP: boolean;
		cookieConsent: boolean; // Require consent for cookies
	};
}

/**
 * Default monitoring configuration
 * Override these values in production
 */
export const defaultConfig: MonitoringConfig = {
	performance: {
		enabled: import.meta.env.PROD, // Only in production by default
		reportInterval: 60000, // Report every minute
		reportEndpoint: undefined,
	},

	analytics: {
		enabled: false, // Must be explicitly enabled
		provider: "none",
		respectDNT: true,
		anonymizeIP: true,
	},

	errorTracking: {
		enabled: import.meta.env.PROD,
		provider: "none",
		environment: import.meta.env.MODE,
		release: import.meta.env.VITE_APP_VERSION || "1.5.2",
		sampleRate: 1.0,
	},

	privacy: {
		respectDNT: true,
		anonymizeIP: true,
		cookieConsent: true,
	},
};

/**
 * Production configuration example (for reference)
 * Set these via environment variables in your deployment
 */
export const productionConfigExample: MonitoringConfig = {
	performance: {
		enabled: true,
		reportInterval: 300000, // 5 minutes
		reportEndpoint: "/api/metrics",
	},

	analytics: {
		enabled: true,
		provider: "plausible", // or 'fathom', 'google'
		siteId: "yourdomain.com", // For Plausible
		// trackingId: 'XXXXXX', // For Fathom/Google
		respectDNT: true,
		anonymizeIP: true,
	},

	errorTracking: {
		enabled: true,
		provider: "sentry",
		dsn: "https://your-sentry-dsn@sentry.io/project-id",
		environment: "production",
		release: "1.5.2",
		sampleRate: 0.5, // Sample 50% of errors
		beforeSend: (error) => {
			// Filter out errors you don't want to track
			if (error.message.includes("ResizeObserver loop")) {
				return null; // Don't send
			}
			return error;
		},
	},

	privacy: {
		respectDNT: true,
		anonymizeIP: true,
		cookieConsent: true,
	},
};

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<MonitoringConfig> {
	return {
		performance: {
			enabled: import.meta.env.VITE_PERFORMANCE_MONITORING === "true",
			reportEndpoint: import.meta.env.VITE_METRICS_ENDPOINT,
		},

		analytics: {
			enabled: import.meta.env.VITE_ANALYTICS_ENABLED === "true",
			provider: (import.meta.env.VITE_ANALYTICS_PROVIDER as AnalyticsConfig["provider"]) || "none",
		},

		errorTracking: {
			enabled: import.meta.env.VITE_ERROR_TRACKING_ENABLED === "true",
			provider:
				(import.meta.env.VITE_ERROR_TRACKING_PROVIDER as ErrorTrackingConfig["provider"]) || "none",
			dsn: import.meta.env.VITE_SENTRY_DSN,
			environment: import.meta.env.MODE,
			release: import.meta.env.VITE_APP_VERSION,
		},
	};
}

/**
 * Merge configs with priority: env > custom > default
 */
export function mergeConfig(customConfig?: Partial<MonitoringConfig>): MonitoringConfig {
	const envConfig = loadConfigFromEnv();

	return {
		performance: {
			...defaultConfig.performance,
			...customConfig?.performance,
			...envConfig.performance,
		},
		analytics: {
			...defaultConfig.analytics,
			...customConfig?.analytics,
			...envConfig.analytics,
		},
		errorTracking: {
			...defaultConfig.errorTracking,
			...customConfig?.errorTracking,
			...envConfig.errorTracking,
		},
		privacy: {
			...defaultConfig.privacy,
			...customConfig?.privacy,
		},
	};
}
