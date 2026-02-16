/**
 * Error tracking integration for production monitoring
 * Supports multiple error tracking services (Sentry, etc.)
 */

import type { AppError } from "./errorHandling";

// Sentry SDK type definitions
interface SentryScope {
	setContext(key: string, value: unknown): void;
	setTag(key: string, value: string): void;
	setUser(user: Record<string, unknown>): void;
}

interface SentryEvent {
	message?: string;
	exception?: {
		values?: Array<{
			value?: string;
			stacktrace?: string;
		}>;
	};
	level?: string;
	contexts?: Record<string, unknown>;
	breadcrumbs?: unknown[];
}

interface SentrySDK {
	init(options: {
		dsn?: string;
		environment?: string;
		release?: string;
		sampleRate?: number;
		beforeSend?: (event: SentryEvent) => SentryEvent | null;
	}): void;
	captureException(error: Error): void;
	withScope(callback: (scope: SentryScope) => void): void;
	addBreadcrumb(breadcrumb: {
		timestamp: number;
		category: string;
		message: string;
		level: string;
		data?: Record<string, unknown>;
	}): void;
	setUser(user: Record<string, unknown>): void;
	setContext(key: string, value: Record<string, unknown>): void;
	setTag(key: string, value: string): void;
}

declare global {
	interface Window {
		Sentry?: SentrySDK;
	}
}

export interface ErrorTrackingConfig {
	enabled: boolean;
	provider: "sentry" | "custom" | "none";
	dsn?: string; // Data Source Name (for Sentry)
	environment?: string; // production, staging, development
	release?: string; // App version
	sampleRate?: number; // 0.0 to 1.0
	beforeSend?: (error: ErrorReport) => ErrorReport | null;
}

export interface ErrorReport {
	message: string;
	stack?: string;
	level: "fatal" | "error" | "warning" | "info";
	timestamp: number;
	url: string;
	userAgent: string;
	context?: Record<string, unknown>;
	breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
	timestamp: number;
	category: string;
	message: string;
	level: "info" | "warning" | "error";
	data?: Record<string, unknown>;
}

let config: ErrorTrackingConfig = {
	enabled: false,
	provider: "none",
	environment: import.meta.env.MODE,
	release: import.meta.env.VITE_APP_VERSION || "unknown",
	sampleRate: 1.0,
};

const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 50;

/**
 * Initialize error tracking
 */
export function initializeErrorTracking(userConfig: Partial<ErrorTrackingConfig> = {}): void {
	config = { ...config, ...userConfig };

	if (!config.enabled) {
		if (import.meta.env.DEV) {
			console.warn("[Error Tracking] Disabled");
		}
		return;
	}

	// Initialize provider
	switch (config.provider) {
		case "sentry":
			initializeSentry();
			break;
		case "custom":
			// Custom implementation can be added here
			break;
	}

	if (import.meta.env.DEV) {
		console.warn("[Error Tracking] Initialized with provider:", config.provider);
	}
}

/**
 * Initialize Sentry error tracking
 */
function initializeSentry(): void {
	if (!config.dsn) {
		console.warn("[Error Tracking] Sentry DSN not configured");
		return;
	}

	// Check if Sentry is already loaded
	if (window.Sentry) {
		window.Sentry.init({
			dsn: config.dsn,
			environment: config.environment,
			release: config.release,
			sampleRate: config.sampleRate,
			beforeSend: (event: SentryEvent) => {
				// Apply custom beforeSend if provided
				if (config.beforeSend) {
					const errorReport = sentryEventToErrorReport(event);
					const processed = config.beforeSend(errorReport);
					return processed ? errorReportToSentryEvent(processed) : null;
				}
				return event;
			},
			integrations: [
				// Add integrations as needed
			],
		});

		if (import.meta.env.DEV) {
			console.warn("[Error Tracking] Sentry initialized");
		}
	} else {
		console.warn("[Error Tracking] Sentry SDK not loaded");
	}
}

/**
 * Track an error
 */
export function trackError(error: Error | string, context?: Record<string, unknown>): void {
	if (!config.enabled) {
		// Still log to console in development
		if (import.meta.env.DEV) {
			console.error("[Error Tracking] Would track:", error, context);
		}
		return;
	}

	// Sample rate check
	if (Math.random() > (config.sampleRate ?? 1.0)) {
		return;
	}

	const errorReport: ErrorReport = {
		message: typeof error === "string" ? error : error.message,
		stack: typeof error === "string" ? undefined : error.stack,
		level: "error",
		timestamp: Date.now(),
		url: window.location.href,
		userAgent: navigator.userAgent,
		context,
		breadcrumbs: [...breadcrumbs],
	};

	// Apply beforeSend hook
	const processed = config.beforeSend ? config.beforeSend(errorReport) : errorReport;
	if (!processed) return;

	// Send to provider
	switch (config.provider) {
		case "sentry":
			sendToSentry(processed);
			break;
		case "custom":
			sendToCustomEndpoint(processed);
			break;
	}
}

/**
 * Send error to Sentry
 */
function sendToSentry(errorReport: ErrorReport): void {
	if (!window.Sentry) return;

	const Sentry = window.Sentry;

	Sentry.withScope((scope: SentryScope) => {
		// Add context
		if (errorReport.context) {
			Object.entries(errorReport.context).forEach(([key, value]) => {
				scope.setContext(key, value);
			});
		}

		// Add breadcrumbs
		errorReport.breadcrumbs?.forEach((breadcrumb) => {
			scope.addBreadcrumb({
				timestamp: breadcrumb.timestamp / 1000, // Sentry uses seconds
				category: breadcrumb.category,
				message: breadcrumb.message,
				level: breadcrumb.level,
				data: breadcrumb.data,
			});
		});

		// Capture exception
		if (errorReport.stack) {
			Sentry.captureException(new Error(errorReport.message));
		} else {
			Sentry.captureMessage(errorReport.message, errorReport.level);
		}
	});
}

/**
 * Send error to custom endpoint
 */
async function sendToCustomEndpoint(errorReport: ErrorReport): Promise<void> {
	try {
		// Use sendBeacon if available (reliable for page unload)
		if (navigator.sendBeacon) {
			navigator.sendBeacon("/api/errors", JSON.stringify(errorReport));
		} else {
			// Fallback to fetch
			await fetch("/api/errors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(errorReport),
				keepalive: true,
			});
		}
	} catch (error) {
		console.warn("[Error Tracking] Failed to send error:", error);
	}
}

/**
 * Add a breadcrumb (for debugging context)
 */
export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, "timestamp">): void {
	const fullBreadcrumb: Breadcrumb = {
		...breadcrumb,
		timestamp: Date.now(),
	};

	breadcrumbs.push(fullBreadcrumb);

	// Keep only recent breadcrumbs
	if (breadcrumbs.length > MAX_BREADCRUMBS) {
		breadcrumbs.shift();
	}

	// Also send to Sentry if available
	if (window.Sentry && config.enabled && config.provider === "sentry") {
		window.Sentry.addBreadcrumb({
			timestamp: fullBreadcrumb.timestamp / 1000,
			category: fullBreadcrumb.category,
			message: fullBreadcrumb.message,
			level: fullBreadcrumb.level,
			data: fullBreadcrumb.data,
		});
	}
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
	id?: string;
	username?: string;
	email?: string;
	[key: string]: unknown;
}): void {
	if (!config.enabled) return;

	if (window.Sentry && config.provider === "sentry") {
		window.Sentry.setUser(user);
	}
}

/**
 * Set custom context/tags
 */
export function setContext(key: string, value: Record<string, unknown>): void {
	if (!config.enabled) return;

	if (window.Sentry && config.provider === "sentry") {
		window.Sentry.setContext(key, value);
	}
}

/**
 * Set custom tag
 */
export function setTag(key: string, value: string): void {
	if (!config.enabled) return;

	if (window.Sentry && config.provider === "sentry") {
		window.Sentry.setTag(key, value);
	}
}

/**
 * Track application errors from errorHandling module
 */
export function trackAppError(appError: AppError): void {
	addBreadcrumb({
		category: "error",
		message: appError.message,
		level:
			appError.severity === "fatal" || appError.severity === "error"
				? "error"
				: appError.severity === "warning"
					? "warning"
					: "info",
		data: {
			component: appError.component,
			recoverable: appError.recoverable,
			context: appError.context,
		},
	});

	if (appError.severity === "fatal" || appError.severity === "error") {
		trackError(appError.message, {
			severity: appError.severity,
			component: appError.component,
			stack: appError.stack,
			...appError.context,
		});
	}
}

/**
 * Helper to convert Sentry event to ErrorReport
 */
function sentryEventToErrorReport(event: SentryEvent): ErrorReport {
	return {
		message: event.message || event.exception?.values?.[0]?.value || "Unknown error",
		stack: event.exception?.values?.[0]?.stacktrace,
		level: event.level || "error",
		timestamp: Date.now(),
		url: window.location.href,
		userAgent: navigator.userAgent,
		context: event.contexts,
		breadcrumbs: event.breadcrumbs,
	};
}

/**
 * Helper to convert ErrorReport to Sentry event
 */
function errorReportToSentryEvent(report: ErrorReport): SentryEvent {
	return {
		message: report.message,
		level: report.level,
		timestamp: report.timestamp / 1000,
		contexts: report.context,
		breadcrumbs: report.breadcrumbs,
	};
}

/**
 * Get current error tracking configuration
 */
export function getErrorTrackingConfig(): Readonly<ErrorTrackingConfig> {
	return { ...config };
}

/**
 * Common breadcrumb helpers
 */
export const Breadcrumbs = {
	navigation: (to: string) =>
		addBreadcrumb({
			category: "navigation",
			message: `Navigated to ${to}`,
			level: "info",
		}),

	userAction: (action: string, data?: Record<string, unknown>) =>
		addBreadcrumb({
			category: "user",
			message: action,
			level: "info",
			data,
		}),

	apiCall: (endpoint: string, method: string, status?: number) =>
		addBreadcrumb({
			category: "api",
			message: `${method} ${endpoint}`,
			level: status && status >= 400 ? "error" : "info",
			data: { endpoint, method, status },
		}),

	stateChange: (store: string, change: string) =>
		addBreadcrumb({
			category: "state",
			message: `${store}: ${change}`,
			level: "info",
		}),
};
