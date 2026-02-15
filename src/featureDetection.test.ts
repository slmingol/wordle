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
			const originalSetItem = Storage.prototype.setItem;
			Storage.prototype.setItem = vi.fn(() => {
				throw new Error("QuotaExceededError");
			});

			expect(hasLocalStorage()).toBe(false);

			Storage.prototype.setItem = originalSetItem;
		});
	});

	describe("hasSessionStorage", () => {
		it("should return true when sessionStorage is available", () => {
			expect(hasSessionStorage()).toBe(true);
		});

		it("should return false when sessionStorage throws error", () => {
			const originalSetItem = Storage.prototype.setItem;
			Storage.prototype.setItem = vi.fn(() => {
				throw new Error("SecurityError");
			});

			expect(hasSessionStorage()).toBe(false);

			Storage.prototype.setItem = originalSetItem;
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
			// jsdom includes serviceWorker by default
			expect(hasServiceWorker()).toBe(true);
		});
	});

	describe("hasES6", () => {
		it("should return true when ES6 features are supported", () => {
			expect(hasES6()).toBe(true);
		});
	});

	describe("isBrowserSupported", () => {
		it("should return true when all required features are available", () => {
			expect(isBrowserSupported()).toBe(true);
		});

		it("should return false when localStorage is not available", () => {
			const originalSetItem = Storage.prototype.setItem;
			Storage.prototype.setItem = vi.fn(() => {
				throw new Error("QuotaExceededError");
			});

			expect(isBrowserSupported()).toBe(false);

			Storage.prototype.setItem = originalSetItem;
		});
	});
});
