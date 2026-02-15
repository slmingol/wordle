import { render as testingLibraryRender } from "@testing-library/svelte";
import type { ComponentProps, SvelteComponent } from "svelte";

/**
 * Custom render function that wraps Testing Library's render
 * with common setup for our Svelte components
 */
export function render<T extends SvelteComponent>(
	component: new (...args: unknown[]) => T,
	options?: ComponentProps<T>
) {
	return testingLibraryRender(component, { props: options });
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
	callback: () => boolean | Promise<boolean>,
	timeout = 3000,
	interval = 50
): Promise<void> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		if (await callback()) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Mock localStorage with spy functions
 */
export function mockLocalStorage() {
	const store: Record<string, string> = {};
	const getItem = vi.fn((key: string) => store[key] || null);
	const setItem = vi.fn((key: string, value: string) => {
		store[key] = value;
	});
	const removeItem = vi.fn((key: string) => {
		delete store[key];
	});
	const clear = vi.fn(() => {
		Object.keys(store).forEach((key) => delete store[key]);
	});

	Object.defineProperty(window, "localStorage", {
		value: { getItem, setItem, removeItem, clear },
		writable: true,
	});

	return { getItem, setItem, removeItem, clear, store };
}

/**
 * Create a mock fetch response
 */
export function mockFetchResponse(data: unknown, ok = true, status = 200) {
	return Promise.resolve({
		ok,
		status,
		json: () => Promise.resolve(data),
		text: () => Promise.resolve(JSON.stringify(data)),
		headers: new Headers(),
		redirected: false,
		statusText: ok ? "OK" : "Error",
		type: "basic" as ResponseType,
		url: "",
		clone: function () {
			return this;
		},
		body: null,
		bodyUsed: false,
		arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
		blob: () => Promise.resolve(new Blob()),
		formData: () => Promise.resolve(new FormData()),
	} as Response);
}

/**
 * Simulate a user typing
 */
export async function typeText(element: HTMLElement, text: string) {
	for (const char of text) {
		const event = new KeyboardEvent("keydown", { key: char });
		element.dispatchEvent(event);
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
}
