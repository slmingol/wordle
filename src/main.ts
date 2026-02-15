//! IF ANYTHING IN THIS FILE IS CHANGED MAKE SURE THE BUILD PROCESS IS UPDATED
// Load polyfills first
import "./polyfills";

import App from "./App.svelte";
import { version } from "./version";
import { setupGlobalErrorHandlers } from "./errorHandling";
import {
	isBrowserSupported,
	showUnsupportedBrowserWarning,
	logFeatureSupport,
} from "./featureDetection";
import { initializeMonitoring, sendMetrics } from "./monitoring";
import { initializeAnalytics } from "./analytics";
import { initializeErrorTracking, trackAppError } from "./errorTracking";
import { mergeConfig } from "./monitoringConfig";
import { errorStore } from "./errorHandling";

// Check browser support
if (!isBrowserSupported()) {
	showUnsupportedBrowserWarning();
	// Still try to run the app, but warn the user
}

// Log feature support in development
if (import.meta.env.DEV) {
	logFeatureSupport();
}

// Setup global error handlers
setupGlobalErrorHandlers();

// Initialize monitoring and analytics
const config = mergeConfig();

// Performance monitoring
initializeMonitoring({
	enabled: config.performance.enabled,
	onMetric: (metric) => {
		// Log in development
		if (import.meta.env.DEV) {
			console.log(`[Performance] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
		}
		
		// Send to endpoint if configured
		if (config.performance.reportEndpoint) {
			// Debounced sending happens automatically
		}
	},
});

// Analytics (requires user consent)
initializeAnalytics(config.analytics);

// Error tracking
initializeErrorTracking(config.errorTracking);

// Connect error store to error tracking
errorStore.subscribe(state => {
	if (state.lastError) {
		trackAppError(state.lastError);
	}
});

// Report metrics periodically if endpoint configured
if (config.performance.enabled && config.performance.reportEndpoint) {
	const interval = config.performance.reportInterval || 60000;
	setInterval(() => {
		sendMetrics(config.performance.reportEndpoint!);
	}, interval);
	
	// Also send on page unload
	window.addEventListener('beforeunload', () => {
		sendMetrics(config.performance.reportEndpoint!);
	});
}

const app = new App({
	target: document.body,
	props: {
		version,
	},
});

export default app;
