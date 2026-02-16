/**
 * Tests for analytics module
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	initializeAnalytics,
	trackPageView,
	trackEvent,
	grantConsent,
	revokeConsent,
	hasConsent,
	updateConfig,
	getConfig,
	GameEvents,
} from "./analytics";

// Mock localStorage
const mockLocalStorage = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, "localStorage", {
	value: mockLocalStorage,
});

describe("Analytics", () => {
	beforeEach(() => {
		mockLocalStorage.clear();
		vi.clearAllMocks();
	});

	describe("initializeAnalytics", () => {
		it("should initialize with config", () => {
			initializeAnalytics({
				enabled: true,
				provider: "plausible",
				siteId: "test.com",
			});

			const config = getConfig();
			expect(config.provider).toBe("plausible");
			expect(config.siteId).toBe("test.com");
		});

		it("should respect DNT when enabled", () => {
			// Mock DNT
			Object.defineProperty(navigator, "doNotTrack", {
				value: "1",
				configurable: true,
			});

			initializeAnalytics({
				enabled: true,
				provider: "plausible",
				respectDNT: true,
			});

			const config = getConfig();
			expect(config.enabled).toBe(false);
		});

		it("should not initialize without consent", () => {
			initializeAnalytics({
				enabled: true,
				provider: "plausible",
			});

			expect(hasConsent()).toBe(false);
		});
	});

	describe("Consent Management", () => {
		it("should grant consent", () => {
			expect(hasConsent()).toBe(false);
			grantConsent();
			expect(hasConsent()).toBe(true);
			expect(mockLocalStorage.getItem("analytics-consent")).toBe("true");
		});

		it("should revoke consent", () => {
			grantConsent();
			expect(hasConsent()).toBe(true);

			revokeConsent();
			expect(hasConsent()).toBe(false);
			expect(mockLocalStorage.getItem("analytics-consent")).toBe("false");
		});
	});

	describe("trackPageView", () => {
		it("should track page view with consent", () => {
			grantConsent();
			initializeAnalytics({ enabled: true, provider: "plausible" });

			expect(() => trackPageView("/test")).not.toThrow();
		});

		it("should not track without consent", () => {
			initializeAnalytics({ enabled: true, provider: "plausible" });

			const spy = vi.fn();
			(window as unknown as Record<string, unknown>).plausible = spy;

			trackPageView("/test");
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe("trackEvent", () => {
		it("should track event with consent", () => {
			grantConsent();
			initializeAnalytics({ enabled: true, provider: "plausible" });

			expect(() =>
				trackEvent({
					name: "test_event",
					properties: { key: "value" },
				})
			).not.toThrow();
		});

		it("should not track without consent", () => {
			initializeAnalytics({ enabled: true, provider: "plausible" });

			const spy = vi.fn();
			(window as unknown as Record<string, unknown>).plausible = spy;

			trackEvent({ name: "test_event" });
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe("updateConfig", () => {
		it("should update configuration", () => {
			updateConfig({ provider: "fathom", trackingId: "123" });

			const config = getConfig();
			expect(config.provider).toBe("fathom");
			expect(config.trackingId).toBe("123");
		});
	});

	describe("GameEvents", () => {
		beforeEach(() => {
			grantConsent();
			initializeAnalytics({ enabled: true, provider: "plausible" });
		});

		it("should track game started", () => {
			expect(() => GameEvents.GAME_STARTED("daily")).not.toThrow();
		});

		it("should track game won", () => {
			expect(() => GameEvents.GAME_WON("daily", 4)).not.toThrow();
		});

		it("should track game lost", () => {
			expect(() => GameEvents.GAME_LOST("daily")).not.toThrow();
		});

		it("should track game shared", () => {
			expect(() => GameEvents.GAME_SHARED("daily")).not.toThrow();
		});

		it("should track settings changed", () => {
			expect(() => GameEvents.SETTINGS_CHANGED("hard-mode", true)).not.toThrow();
		});

		it("should track theme changed", () => {
			expect(() => GameEvents.THEME_CHANGED("dark")).not.toThrow();
		});

		it("should track mode switched", () => {
			expect(() => GameEvents.MODE_SWITCHED("daily", "infinite")).not.toThrow();
		});
	});
});
