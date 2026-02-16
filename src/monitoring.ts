/**
 * Performance monitoring and Core Web Vitals tracking
 * Tracks user experience metrics for performance optimization
 */

export interface PerformanceMetric {
	name: string;
	value: number;
	rating: "good" | "needs-improvement" | "poor";
	timestamp: number;
}

export interface WebVitalsMetrics {
	CLS?: PerformanceMetric; // Cumulative Layout Shift
	FID?: PerformanceMetric; // First Input Delay
	LCP?: PerformanceMetric; // Largest Contentful Paint
	FCP?: PerformanceMetric; // First Contentful Paint
	TTFB?: PerformanceMetric; // Time to First Byte
	INP?: PerformanceMetric; // Interaction to Next Paint
}

// Threshold values based on Google's recommendations
const THRESHOLDS = {
	CLS: { good: 0.1, poor: 0.25 },
	FID: { good: 100, poor: 300 },
	LCP: { good: 2500, poor: 4000 },
	FCP: { good: 1800, poor: 3000 },
	TTFB: { good: 800, poor: 1800 },
	INP: { good: 200, poor: 500 },
};

/**
 * Rate a metric value as good, needs-improvement, or poor
 */
function rateMetric(name: keyof typeof THRESHOLDS, value: number): PerformanceMetric["rating"] {
	const threshold = THRESHOLDS[name];
	if (value <= threshold.good) return "good";
	if (value <= threshold.poor) return "needs-improvement";
	return "poor";
}

/**
 * Store for collected metrics
 */
const metrics: WebVitalsMetrics = {};

/**
 * Callback type for metric reporting
 */
type MetricCallback = (metric: PerformanceMetric) => void;

let metricsCallback: MetricCallback | null = null;

/**
 * Set callback for when metrics are collected
 */
export function onMetric(callback: MetricCallback): void {
	metricsCallback = callback;
}

/**
 * Report a metric
 */
function reportMetric(metric: PerformanceMetric): void {
	// Store metric
	metrics[metric.name as keyof WebVitalsMetrics] = metric;

	// Call callback if set
	if (metricsCallback) {
		try {
			metricsCallback(metric);
		} catch (error) {
			console.warn("Error in metric callback:", error);
		}
	}

	// Log in development
	if (import.meta.env.DEV) {
		console.warn(`[Performance] ${metric.name}:`, {
			value: Math.round(metric.value),
			rating: metric.rating,
		});
	}
}

/**
 * Track Cumulative Layout Shift (CLS)
 */
function trackCLS(): void {
	if (!("PerformanceObserver" in window)) return;

	let clsValue = 0;
	const clsEntries: PerformanceEntry[] = [];

	const observer = new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) {
			// Only count layout shifts without recent user input
			if (!(entry as any).hadRecentInput) {
				clsValue += (entry as any).value;
				clsEntries.push(entry);
			}
		}
	});

	observer.observe({ type: "layout-shift", buffered: true });

	// Report on page hide
	const reportCLS = () => {
		reportMetric({
			name: "CLS",
			value: clsValue,
			rating: rateMetric("CLS", clsValue),
			timestamp: Date.now(),
		});
	};

	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") {
			reportCLS();
		}
	});

	// Also report on beforeunload
	addEventListener("beforeunload", reportCLS);
}

/**
 * Track First Input Delay (FID)
 */
function trackFID(): void {
	if (!("PerformanceObserver" in window)) return;

	const observer = new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) {
			const fidValue = (entry as any).processingStart - entry.startTime;
			reportMetric({
				name: "FID",
				value: fidValue,
				rating: rateMetric("FID", fidValue),
				timestamp: Date.now(),
			});
			observer.disconnect();
		}
	});

	observer.observe({ type: "first-input", buffered: true });
}

/**
 * Track Largest Contentful Paint (LCP)
 */
function trackLCP(): void {
	if (!("PerformanceObserver" in window)) return;

	let lcpValue = 0;

	const observer = new PerformanceObserver((list) => {
		const entries = list.getEntries();
		const lastEntry = entries[entries.length - 1];
		lcpValue = lastEntry.startTime;
	});

	observer.observe({ type: "largest-contentful-paint", buffered: true });

	// Report on page hide
	const reportLCP = () => {
		if (lcpValue) {
			reportMetric({
				name: "LCP",
				value: lcpValue,
				rating: rateMetric("LCP", lcpValue),
				timestamp: Date.now(),
			});
		}
	};

	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") {
			reportLCP();
			observer.disconnect();
		}
	});
}

/**
 * Track First Contentful Paint (FCP)
 */
function trackFCP(): void {
	if (!("PerformanceObserver" in window)) return;

	const observer = new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) {
			if (entry.name === "first-contentful-paint") {
				reportMetric({
					name: "FCP",
					value: entry.startTime,
					rating: rateMetric("FCP", entry.startTime),
					timestamp: Date.now(),
				});
				observer.disconnect();
			}
		}
	});

	observer.observe({ type: "paint", buffered: true });
}

/**
 * Track Time to First Byte (TTFB)
 */
function trackTTFB(): void {
	if (!window.performance?.timing) return;

	// Use Navigation Timing API
	const navTiming = performance.timing;
	const ttfb = navTiming.responseStart - navTiming.requestStart;

	if (ttfb >= 0) {
		reportMetric({
			name: "TTFB",
			value: ttfb,
			rating: rateMetric("TTFB", ttfb),
			timestamp: Date.now(),
		});
	}
}

/**
 * Track Interaction to Next Paint (INP)
 * This is a newer metric that measures responsiveness
 */
function trackINP(): void {
	if (!("PerformanceObserver" in window)) return;

	const observer = new PerformanceObserver((list) => {
		let maxDuration = 0;

		for (const entry of list.getEntries()) {
			const duration = (entry as any).duration || 0;
			maxDuration = Math.max(maxDuration, duration);
		}

		if (maxDuration > 0) {
			reportMetric({
				name: "INP",
				value: maxDuration,
				rating: rateMetric("INP", maxDuration),
				timestamp: Date.now(),
			});
		}
	});

	try {
		observer.observe({ type: "event", buffered: true, durationThreshold: 16 });
	} catch {
		// Event timing not supported
	}
}

/**
 * Track custom performance marks
 */
export function trackMark(name: string): void {
	if (!window.performance?.mark) return;
	performance.mark(name);
}

/**
 * Measure time between two marks
 */
export function measureMarks(name: string, startMark: string, endMark: string): number | null {
	if (!window.performance || typeof performance.measure !== "function") return null;

	try {
		performance.measure(name, startMark, endMark);
		const measure = performance.getEntriesByName(name, "measure")[0];
		return measure?.duration || null;
	} catch (error) {
		console.warn("Failed to measure marks:", error);
		return null;
	}
}

/**
 * Get navigation timing metrics
 */
export function getNavigationMetrics(): Record<string, number> | null {
	if (!window.performance?.timing) return null;

	const timing = performance.timing;
	const navigationStart = timing.navigationStart;

	return {
		dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
		tcpConnection: timing.connectEnd - timing.connectStart,
		requestTime: timing.responseStart - timing.requestStart,
		responseTime: timing.responseEnd - timing.responseStart,
		domProcessing: timing.domComplete - timing.domLoading,
		domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
		pageLoad: timing.loadEventEnd - navigationStart,
	};
}

/**
 * Get resource timing metrics
 */
export function getResourceMetrics(): PerformanceResourceTiming[] {
	if (!window.performance?.getEntriesByType) return [];
	return performance.getEntriesByType("resource") as PerformanceResourceTiming[];
}

/**
 * Get all collected Web Vitals metrics
 */
export function getMetrics(): WebVitalsMetrics {
	return { ...metrics };
}

/**
 * Initialize performance monitoring
 */
export function initializeMonitoring(
	options: {
		enabled?: boolean;
		onMetric?: MetricCallback;
	} = {}
): void {
	const { enabled = true, onMetric: callback } = options;

	if (!enabled) {
		if (import.meta.env.DEV) {
			console.warn("[Monitoring] Performance monitoring disabled");
		}
		return;
	}

	if (callback) {
		metricsCallback = callback;
	}

	// Track all Core Web Vitals
	trackCLS();
	trackFID();
	trackLCP();
	trackFCP();
	trackTTFB();
	trackINP();

	if (import.meta.env.DEV) {
		console.warn("[Monitoring] Performance monitoring initialized");
	}
}

/**
 * Send metrics to analytics endpoint
 */
export async function sendMetrics(endpoint: string): Promise<void> {
	const metricsData = getMetrics();

	if (Object.keys(metricsData).length === 0) {
		return;
	}

	try {
		// Use sendBeacon if available (reliable for page unload)
		if (navigator.sendBeacon) {
			navigator.sendBeacon(endpoint, JSON.stringify(metricsData));
		} else {
			// Fallback to fetch
			await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(metricsData),
				keepalive: true,
			});
		}
	} catch (error) {
		console.warn("Failed to send metrics:", error);
	}
}
