import { describe, it, expect, vi } from "vitest";
import {
	hasLocalStorage,
	hasSessionStorage,
	hasFetch,
	hasPromises,
	hasServiceWorker,
	hasES6,
	isBrowserSupported,
} from "./featureDetection";

describe("featureDetection", () => {
	describe("hasLocalStorage", () => {
		it("should return true when localStorage is available", () => {
			expect(hasLocalStorage()).toBe(true);
		});

		it("should return false when localStorage throws error", () => {
			const originalSetItem = window.localStorage.setItem;
			window.localStorage.setItem = vi.fn(() => {
				throw new Error("QuotaExceededError");
			});

			expect(hasLocalStorage()).toBe(false);

			window.localStorage.setItem = originalSetItem;
		});
	});

	describe("hasSessionStorage", () => {
		it("should return true when sessionStorage is available", () => {
			expect(hasSessionStorage()).toBe(true);
		});

		it("should return false when sessionStorage throws error", () => {
			const originalSetItem = window.sessionStorage.setItem;
			window.sessionStorage.setItem = vi.fn(() => {
				throw new Error("SecurityError");
			});

			expect(hasSessionStorage()).toBe(false);

			window.sessionStorage.setItem = originalSetItem;
		});
	});

	describe("hasFetch", () => {
		it("should return true when fetch is available", () => {
			expect(hasFetch()).toBe(true);
		});

		it("should return false when fetch is undefined", () => {
			const originalFetch = global.fetch;
			// @ts-expect-error - Testing undefined fetch
			global.fetch = undefined;

			expect(hasFetch()).toBe(false);

			global.fetch = originalFetch;
		});
	});

	describe("hasPromises", () => {
		it("should return true when Promises are available", () => {
			expect(hasPromises()).toBe(true);
		});

		it("should return false when Promise is undefined", () => {
			const originalPromise = global.Promise;
			// @ts-expect-error - Testing undefined Promise
			global.Promise = undefined;

			expect(hasPromises()).toBe(false);

			global.Promise = originalPromise;
		});
	});

	describe("hasServiceWorker", () => {
		it("should return true when serviceWorker is in navigator", () => {
			// Mock serviceWorker in navigator if not present
			const hasServiceWorkerSupport = "serviceWorker" in navigator;
			if (!hasServiceWorkerSupport) {
				// @ts-expect-error - Testing serviceWorker presence
				navigator.serviceWorker = {};
			}

			expect(hasServiceWorker()).toBe(true);

			if (!hasServiceWorkerSupport) {
				// @ts-expect-error - Cleanup
				delete navigator.serviceWorker;
			}
		});
	});

	describe("hasES6", () => {
		it("should return true when ES6 features are supported", () => {
			expect(hasES6()).toBe(true);
		});
	});

	describe("isBrowserSupported", () => {
		it("should return true when all required features are available", () => {
			// Mock CSS.supports for the test environment
			const originalCSS = globalThis.CSS;
			globalThis.CSS = {
				supports: vi.fn((_property: string, _value: string) => true),
			} as unknown as typeof CSS;

			expect(isBrowserSupported()).toBe(true);

			// Restore original CSS
			globalThis.CSS = originalCSS;
		});

		it("should return false when localStorage is not available", () => {
			const originalSetItem = window.localStorage.setItem;
			window.localStorage.setItem = vi.fn(() => {
				throw new Error(" QuotaExceededError");
			});

			expect(isBrowserSupported()).toBe(false);

			window.localStorage.setItem = originalSetItem;
		});
	});
});
