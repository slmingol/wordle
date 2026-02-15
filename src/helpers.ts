/**
 * Common helper functions to reduce code duplication
 */

import type { Toaster } from "./components/widgets";
import type { Board } from "./components/board";

/**
 * Shows a toast message and shakes the board
 */
export function showErrorFeedback(
	toaster: Toaster,
	board: Board,
	message: string,
	row: number
): void {
	toaster.pop(message);
	board.shake(row);
}

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function ordinal(num: number): string {
	const suffixes = ["th", "st", "nd", "rd"];
	const value = num % 100;
	return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Throttle function to ensure a function is called at most once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
	fn: T,
	interval: number
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	return (...args: Parameters<T>) => {
		const now = Date.now();
		if (now - lastCall >= interval) {
			lastCall = now;
			fn(...args);
		}
	};
}

/**
 * Format milliseconds to human readable time
 */
export function formatTime(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	}
	return `${seconds}s`;
}

/**
 * Deep clone an object using JSON (fast, but limited to JSON-serializable data)
 */
export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((val, index) => val === b[index]);
}

/**
 * Generate a random integer between min (inclusive) and max (exclusive)
 */
export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Safely access nested object properties
 */
export function getNestedProperty<T>(obj: unknown, path: string, fallback: T): T {
	const keys = path.split(".");
	let current: unknown = obj;

	for (const key of keys) {
		if (current && typeof current === "object" && key in current) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return fallback;
		}
	}

	return (current as T) ?? fallback;
}
