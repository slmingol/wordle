/**
 * Safe localStorage utilities with error handling
 */

import { isString } from "./validation";

/**
 * Safely get an item from localStorage
 * @param key - The key to retrieve
 * @param fallback - Optional fallback value if retrieval fails
 * @returns The stored value or fallback/null
 */
export function safeGetItem(key: string, fallback: string | null = null): string | null {
	if (!isString(key) || key.trim() === "") {
		console.warn("Invalid localStorage key provided");
		return fallback;
	}
	try {
		const value = localStorage.getItem(key);
		return value !== null ? value : fallback;
	} catch (error) {
		console.warn(`Failed to get localStorage item '${key}':`, error);
		return fallback;
	}
}

/**
 * Safely set an item in localStorage
 * @param key - The key to set
 * @param value - The value to store
 * @returns True if successful, false otherwise
 */
export function safeSetItem(key: string, value: string): boolean {
	if (!isString(key) || key.trim() === "") {
		console.warn("Invalid localStorage key provided");
		return false;
	}
	if (!isString(value)) {
		console.warn("Invalid localStorage value provided (must be string)");
		return false;
	}
	try {
		localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.warn(`Failed to set localStorage item '${key}':`, error);
		// Quota exceeded or other storage error
		if (error instanceof DOMException && error.name === "QuotaExceededError") {
			console.error("localStorage quota exceeded. Consider clearing old data.");
		}
		return false;
	}
}

/**
 * Safely remove an item from localStorage
 * @param key - The key to remove
 * @returns True if successful, false otherwise
 */
export function safeRemoveItem(key: string): boolean {
	if (!isString(key) || key.trim() === "") {
		console.warn("Invalid localStorage key provided");
		return false;
	}
	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.warn(`Failed to remove localStorage item '${key}':`, error);
		return false;
	}
}

/**
 * Safely clear all localStorage
 * @returns True if successful, false otherwise
 */
export function safeClear(): boolean {
	try {
		localStorage.clear();
		return true;
	} catch (error) {
		console.warn("Failed to clear localStorage:", error);
		return false;
	}
}

/**
 * Safely parse JSON from localStorage
 * @param key - The key to retrieve
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeGetJSON<T>(key: string, fallback: T): T {
	if (!isString(key) || key.trim() === "") {
		console.warn("Invalid localStorage key provided");
		return fallback;
	}
	try {
		const value = localStorage.getItem(key);
		if (value === null) return fallback;
		return JSON.parse(value) as T;
	} catch (error) {
		console.warn(`Failed to parse localStorage JSON for '${key}':`, error);
		return fallback;
	}
}

/**
 * Safely store JSON in localStorage
 * @param key - The key to set
 * @param value - The value to store (will be JSON stringified)
 * @returns True if successful, false otherwise
 */
export function safeSetJSON(key: string, value: unknown): boolean {
	if (!isString(key) || key.trim() === "") {
		console.warn("Invalid localStorage key provided");
		return false;
	}
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.warn(`Failed to set localStorage JSON for '${key}':`, error);
		return false;
	}
}
