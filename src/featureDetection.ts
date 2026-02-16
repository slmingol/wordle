/**
 * Feature detection utilities for browser compatibility
 * Provides graceful degradation for unsupported features
 */

export interface BrowserFeatures {
	localStorage: boolean;
	sessionStorage: boolean;
	serviceWorker: boolean;
	fetch: boolean;
	promises: boolean;
	intersectionObserver: boolean;
	resizeObserver: boolean;
	webWorkers: boolean;
	es6: boolean;
	css: {
		grid: boolean;
		flexbox: boolean;
		customProperties: boolean;
		backdrop: boolean;
	};
}

/**
 * Check if localStorage is available and working
 */
export function hasLocalStorage(): boolean {
	try {
		const test = "__storage_test__";
		window.localStorage.setItem(test, test);
		window.localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Check if sessionStorage is available and working
 */
export function hasSessionStorage(): boolean {
	try {
		const test = "__storage_test__";
		window.sessionStorage.setItem(test, test);
		window.sessionStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Check if service workers are supported
 */
export function hasServiceWorker(): boolean {
	return "serviceWorker" in navigator;
}

/**
 * Check if fetch API is supported
 */
export function hasFetch(): boolean {
	return typeof fetch === "function";
}

/**
 * Check if Promises are supported
 */
export function hasPromises(): boolean {
	return typeof Promise !== "undefined" && Promise.toString().includes("[native code]");
}

/**
 * Check if IntersectionObserver is supported
 */
export function hasIntersectionObserver(): boolean {
	return (
		"IntersectionObserver" in window &&
		"IntersectionObserverEntry" in window &&
		"intersectionRatio" in window.IntersectionObserverEntry.prototype
	);
}

/**
 * Check if ResizeObserver is supported
 */
export function hasResizeObserver(): boolean {
	return "ResizeObserver" in window;
}

/**
 * Check if Web Workers are supported
 */
export function hasWebWorkers(): boolean {
	return typeof Worker !== "undefined";
}

/**
 * Check if ES6 features are supported
 */
export function hasES6(): boolean {
	try {
		// Check for ES6 features without using Function constructor (CSP-friendly)
		// Check for: const/let, arrow functions, template literals, spread, destructuring
		const testObj = { a: 1, b: 2 };
		const { a, ...rest } = testObj;
		const arr = [1, 2, 3];
		const [first, ...remaining] = arr;
		const arrowFn = () => true;
		const template = `test ${a}`;

		return typeof Promise !== "undefined" && typeof Symbol !== "undefined";
	} catch (e) {
		return false;
	}
}

/**
 * Check if CSS Grid is supported
 */
export function hasCSSGrid(): boolean {
	try {
		return (
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("display", "grid")
		);
	} catch (e) {
		return false;
	}
}

/**
 * Check if CSS Flexbox is supported
 */
export function hasCSSFlexbox(): boolean {
	try {
		return (
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("display", "flex")
		);
	} catch (e) {
		return false;
	}
}

/**
 * Check if CSS Custom Properties (variables) are supported
 */
export function hasCSSCustomProperties(): boolean {
	try {
		return (
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("--test", "0")
		);
	} catch (e) {
		return false;
	}
}

/**
 * Check if CSS backdrop-filter is supported
 */
export function hasCSSBackdrop(): boolean {
	try {
		return (
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			(CSS.supports("backdrop-filter", "blur(10px)") ||
				CSS.supports("-webkit-backdrop-filter", "blur(10px)"))
		);
	} catch (e) {
		return false;
	}
}

/**
 * Get all browser feature support
 */
export function detectFeatures(): BrowserFeatures {
	return {
		localStorage: hasLocalStorage(),
		sessionStorage: hasSessionStorage(),
		serviceWorker: hasServiceWorker(),
		fetch: hasFetch(),
		promises: hasPromises(),
		intersectionObserver: hasIntersectionObserver(),
		resizeObserver: hasResizeObserver(),
		webWorkers: hasWebWorkers(),
		es6: hasES6(),
		css: {
			grid: hasCSSGrid(),
			flexbox: hasCSSFlexbox(),
			customProperties: hasCSSCustomProperties(),
			backdrop: hasCSSBackdrop(),
		},
	};
}

/**
 * Check if browser is supported (meets minimum requirements)
 */
export function isBrowserSupported(): boolean {
	const features = detectFeatures();
	return (
		features.localStorage &&
		features.fetch &&
		features.promises &&
		features.es6 &&
		features.css.flexbox &&
		features.css.customProperties
	);
}

/**
 * Display unsupported browser warning
 */
export function showUnsupportedBrowserWarning(): void {
	const warning = document.createElement("div");
	warning.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: #f44336;
		color: white;
		padding: 1rem;
		text-align: center;
		z-index: 10000;
		font-family: sans-serif;
	`;
	warning.innerHTML = `
		<strong>Unsupported Browser</strong><br>
		Your browser doesn't support all features needed for this app.
		Please update to the latest version or use a modern browser like Chrome, Firefox, Safari, or Edge.
	`;
	document.body.insertBefore(warning, document.body.firstChild);
}

/**
 * Log feature support for debugging
 */
export function logFeatureSupport(): void {
	if (typeof console !== "undefined" && console.table) {
		const features = detectFeatures();
		console.table(features);
	}
}
