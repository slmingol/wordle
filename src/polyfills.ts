/**
 * Polyfills for older browser support
 * Only includes what's actually needed by the app
 */

// Polyfill for Promise.finally (Safari < 13.1, IE)
if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
	Promise.prototype.finally = function (callback) {
		const constructor = this.constructor;
		return this.then(
			(value) => constructor.resolve(callback()).then(() => value),
			(reason) =>
				constructor.resolve(callback()).then(() => {
					throw reason;
				})
		);
	};
}

// Polyfill for Object.fromEntries (Safari < 12.1, Edge < 79)
if (!Object.fromEntries) {
	Object.fromEntries = function (entries) {
		const obj = {};
		for (const [key, value] of entries) {
			obj[key] = value;
		}
		return obj;
	};
}

// Polyfill for Array.prototype.at (Safari < 15.4, Chrome < 92)
if (!Array.prototype.at) {
	Array.prototype.at = function (index) {
		const len = this.length;
		const relativeIndex = index >= 0 ? index : len + index;
		if (relativeIndex < 0 || relativeIndex >= len) {
			return undefined;
		}
		return this[relativeIndex];
	};
}

// Polyfill for String.prototype.replaceAll (Safari < 13.1, Edge < 85)
if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function (search, replace) {
		if (typeof search === "string") {
			return this.split(search).join(replace);
		}
		return this.replace(search, replace);
	};
}

// Polyfill for requestAnimationFrame (IE 9)
if (!window.requestAnimationFrame) {
	let lastTime = 0;
	window.requestAnimationFrame = function (callback) {
		const currentTime = new Date().getTime();
		const timeToCall = Math.max(0, 16 - (currentTime - lastTime));
		const id = window.setTimeout(() => {
			callback(currentTime + timeToCall);
		}, timeToCall);
		lastTime = currentTime + timeToCall;
		return id;
	};
}

// Polyfill for cancelAnimationFrame (IE 9)
if (!window.cancelAnimationFrame) {
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

// Polyfill for CSS.supports (older browsers)
if (typeof CSS === "undefined" || !CSS.supports) {
	window.CSS = window.CSS || {};
	CSS.supports = function () {
		// Minimal implementation - just return true for basic checks
		// Real implementation would require parsing and testing CSS
		return true;
	};
}

// Polyfill for AbortController (Safari < 12.1, Edge < 79)
if (typeof AbortController === "undefined") {
	class AbortController {
		constructor() {
			this.signal = {
				aborted: false,
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => true,
			};
		}
		abort() {
			this.signal.aborted = true;
		}
	}
	window.AbortController = AbortController;
}

// Export for module systems
export {};
