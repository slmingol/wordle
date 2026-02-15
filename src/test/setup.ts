import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
		get length() {
			return Object.keys(store).length;
		},
		key: (index: number) => {
			const keys = Object.keys(store);
			return keys[index] || null;
		},
	};
})();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

Object.defineProperty(window, "sessionStorage", {
	value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock IntersectionObserver
class IntersectionObserverMock {
	constructor() {}
	observe() {}
	unobserve() {}
	disconnect() {}
}

Object.defineProperty(window, "IntersectionObserver", {
	writable: true,
	value: IntersectionObserverMock,
});

// Mock ResizeObserver
class ResizeObserverMock {
	constructor() {}
	observe() {}
	unobserve() {}
	disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
	writable: true,
	value: ResizeObserverMock,
});

// Reset all mocks before each test
beforeEach(() => {
	localStorageMock.clear();
});
