/**
 * Error handling and error boundary utilities
 */

import { writable, type Writable } from "svelte/store";

export interface AppError {
	id: string;
	message: string;
	stack?: string;
	timestamp: number;
	severity: "info" | "warning" | "error" | "fatal";
	component?: string;
	recoverable: boolean;
	context?: Record<string, unknown>;
}

export interface ErrorState {
	errors: AppError[];
	lastError: AppError | null;
	hasError: boolean;
}

/**
 * Global error store
 */
function createErrorStore() {
	const { subscribe, set, update }: Writable<ErrorState> = writable({
		errors: [],
		lastError: null,
		hasError: false,
	});

	return {
		subscribe,
		/**
		 * Add an error to the store
		 * Supports both simple (message, severity, details) and complex (full AppError object) signatures
		 */
		addError: (
			messageOrError: string | Omit<AppError, "id" | "timestamp">,
			severity: AppError["severity"] = "error",
			details?: Record<string, unknown>
		) => {
			let errorData: Omit<AppError, "id" | "timestamp">;

			// Check if first parameter is a string (simple API)
			if (typeof messageOrError === "string") {
				errorData = {
					message: messageOrError,
					severity,
					recoverable: severity !== "fatal",
					context: details,
				};
			} else {
				// Complex API - full error object
				errorData = messageOrError;
			}

			const appError: AppError = {
				...errorData,
				id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				timestamp: Date.now(),
			};

			update((state) => ({
				errors: [...state.errors, appError],
				lastError: appError,
				hasError: true,
			}));

			// Auto-remove recoverable errors after 10 seconds
			if (appError.recoverable) {
				setTimeout(() => {
					errorStore.removeError(appError.id);
				}, 10000);
			}

			return appError.id;
		},
		/**
		 * Remove an error by ID
		 */
		removeError: (id: string) => {
			update((state) => {
				const errors = state.errors.filter((e) => e.id !== id);
				return {
					errors,
					lastError: errors[errors.length - 1] || null,
					hasError: errors.length > 0,
				};
			});
		},
		/**
		 * Clear all errors
		 */
		clearErrors: () => {
			set({
				errors: [],
				lastError: null,
				hasError: false,
			});
		},
		/**
		 * Clear errors by severity
		 */
		clearBySeverity: (severity: AppError["severity"]) => {
			update((state) => {
				const errors = state.errors.filter((e) => e.severity !== severity);
				return {
					errors,
					lastError: errors[errors.length - 1] || null,
					hasError: errors.length > 0,
				};
			});
		},
	};
}

export const errorStore = createErrorStore();

/**
 * Create an error object from an unknown error
 */
export function normalizeError(
	error: unknown,
	component?: string,
	severity: AppError["severity"] = "error"
): Omit<AppError, "id" | "timestamp"> {
	if (error instanceof Error) {
		return {
			message: error.message,
			stack: error.stack,
			severity,
			component,
			recoverable: severity !== "fatal",
			context: error.stack ? { stack: error.stack } : undefined,
		};
	}

	// Handle null and undefined
	if (error === null || error === undefined) {
		return {
			message: "Unknown error occurred",
			severity,
			component,
			recoverable: severity !== "fatal",
		};
	}

	// Handle strings
	if (typeof error === "string") {
		return {
			message: error,
			severity,
			component,
			recoverable: severity !== "fatal",
		};
	}

	// Handle objects
	return {
		message: `Unknown error: ${JSON.stringify(error)}`,
		severity,
		component,
		recoverable: severity !== "fatal",
	};
}

/**
 * Handle an error and add it to the store
 */
export function handleError(
	error: unknown,
	component?: string,
	severity: AppError["severity"] = "error",
	context?: Record<string, unknown>
): string {
	const normalized = normalizeError(error, component, severity);
	return errorStore.addError({ ...normalized, context });
}

/**
 * Try-catch wrapper for async functions
 */
export async function tryCatch<T>(
	fn: () => Promise<T>,
	component?: string,
	fallback?: T
): Promise<T | undefined> {
	try {
		return await fn();
	} catch (error) {
		handleError(error, component, "error");
		return fallback;
	}
}

/**
 * Try-catch wrapper for sync functions
 */
export function tryCatchSync<T>(fn: () => T, component?: string, fallback?: T): T | undefined {
	try {
		return fn();
	} catch (error) {
		handleError(error, component, "error");
		return fallback;
	}
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers() {
	// Handle unhandled promise rejections
	window.addEventListener("unhandledrejection", (event) => {
		event.preventDefault();
		handleError(event.reason, "UnhandledPromise", "error", {
			promise: event.promise,
		});
	});

	// Handle global errors
	window.addEventListener("error", (event) => {
		event.preventDefault();
		handleError(event.error || event.message, "GlobalError", "error", {
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno,
		});
	});

	// Log errors in development
	if (import.meta.env.DEV) {
		errorStore.subscribe((state) => {
			if (state.lastError) {
				console.error("[Error Store]", state.lastError);
			}
		});
	}
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<T> {
	let lastError: unknown;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (i < maxRetries - 1) {
				const delay = baseDelay * Math.pow(2, i);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
}
