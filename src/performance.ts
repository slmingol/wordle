/**
 * Performance optimization utilities
 */

/**
 * Simple memoization for pure functions
 */
export function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
	const cache = new Map();
	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

/**
 * Memoization with cache size limit (LRU-like)
 */
export function memoizeWithLimit<T extends (...args: never[]) => unknown>(
	fn: T,
	maxSize: number = 100
): T {
	const cache = new Map();
	const keys: string[] = [];

	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}

		const result = fn(...args);
		cache.set(key, result);
		keys.push(key);

		// Remove oldest entry if cache is full
		if (keys.length > maxSize) {
			const oldestKey = keys.shift();
			cache.delete(oldestKey);
		}

		return result;
	}) as T;
}

/**
 * Debounced writable store
 */
export function debouncedWritable<T>(value: T, delay: number = 300) {
	const store = {
		value,
		subscribers: new Set<(value: T) => void>(),
		timeoutId: null as ReturnType<typeof setTimeout> | null,

		set(newValue: T) {
			if (this.timeoutId) clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(() => {
				this.value = newValue;
				this.subscribers.forEach((fn) => fn(newValue));
			}, delay);
		},

		update(fn: (value: T) => T) {
			this.set(fn(this.value));
		},

		subscribe(fn: (value: T) => void) {
			this.subscribers.add(fn);
			fn(this.value);
			return () => this.subscribers.delete(fn);
		},
	};

	return store;
}

/**
 * Lazy load a module only when needed
 */
export async function lazyLoad<T>(loader: () => Promise<{ default: T }>): Promise<T> {
	const module = await loader();
	return module.default;
}

/**
 * Create a performance observer for measuring component render times
 */
export function measurePerformance(name: string, fn: () => void) {
	if (typeof performance !== "undefined" && performance.mark) {
		performance.mark(`${name}-start`);
		fn();
		performance.mark(`${name}-end`);
		performance.measure(name, `${name}-start`, `${name}-end`);
		const measure = performance.getEntriesByName(name)[0];
		console.warn(`${name} took ${measure.duration.toFixed(2)}ms`);
	} else {
		fn();
	}
}

/**
 * Optimize array operations by batching updates
 */
export function batchArrayUpdates<T>(arr: T[], updates: Array<{ index: number; value: T }>): T[] {
	const newArr = [...arr];
	updates.forEach(({ index, value }) => {
		newArr[index] = value;
	});
	return newArr;
}

/**
 * Check if component should update (shallow comparison)
 */
export function shouldUpdate(
	prev: Record<string, unknown>,
	next: Record<string, unknown>
): boolean {
	const prevKeys = Object.keys(prev);
	const nextKeys = Object.keys(next);

	if (prevKeys.length !== nextKeys.length) return true;

	return prevKeys.some((key) => prev[key] !== next[key]);
}
