import { describe, it, expect, beforeEach } from "vitest";
import { errorStore, normalizeError } from "./errorHandling";
import { get } from "svelte/store";

describe("errorHandling", () => {
	beforeEach(() => {
		errorStore.clearErrors();
	});

	describe("errorStore", () => {
		it("should initialize with empty array", () => {
			const state = get(errorStore);
			expect(state.errors).toEqual([]);
		});

		it("should add errors to store", () => {
			errorStore.addError("Test error", "error");

			const state = get(errorStore);
			expect(state.errors).toHaveLength(1);
			expect(state.errors[0].message).toBe("Test error");
			expect(state.errors[0].severity).toBe("error");
		});

		it("should generate unique IDs for errors", () => {
			errorStore.addError("Error 1", "error");
			errorStore.addError("Error 2", "warning");

			const state = get(errorStore);
			expect(state.errors[0].id).not.toBe(state.errors[1].id);
		});

		it("should include timestamp in errors", () => {
			const before = Date.now();
			errorStore.addError("Test error", "info");
			const after = Date.now();

			const state = get(errorStore);
			expect(state.errors[0].timestamp).toBeGreaterThanOrEqual(before);
			expect(state.errors[0].timestamp).toBeLessThanOrEqual(after);
		});
	});

	describe("addError", () => {
		it("should add error with default severity", () => {
			errorStore.addError("Default severity error");

			const state = get(errorStore);
			expect(state.errors[0].severity).toBe("error");
		});

		it("should add error with specified severity", () => {
			errorStore.addError("Warning message", "warning");

			const state = get(errorStore);
			expect(state.errors[0].severity).toBe("warning");
		});

		it("should add error with details", () => {
			errorStore.addError("Error with details", "error", { code: 404, url: "/api/test" });

			const state = get(errorStore);
			expect(state.errors[0].details).toEqual({ code: 404, url: "/api/test" });
		});
	});

	describe("clearErrors", () => {
		it("should remove all errors", () => {
			errorStore.addError("Error 1", "error");
			errorStore.addError("Error 2", "warning");
			errorStore.addError("Error 3", "info");

			expect(get(errorStore).errors).toHaveLength(3);

			errorStore.clearErrors();

			expect(get(errorStore).errors).toHaveLength(0);
		});
	});

	describe("normalizeError", () => {
		it("should convert Error to AppError", () => {
			const error = new Error("Test error");
			const normalized = normalizeError(error);

			expect(normalized.message).toBe("Test error");
			expect(normalized.severity).toBe("error");
		});

		it("should handle string errors", () => {
			const normalized = normalizeError("String error");

			expect(normalized.message).toBe("String error");
		});

		it("should handle unknown errors", () => {
			const normalized = normalizeError({ custom: "object" });

			expect(normalized.message).toContain("Unknown error");
		});

		it("should preserve error stack if available", () => {
			const error = new Error("Test");
			const normalized = normalizeError(error);

			expect(normalized.details?.stack).toBeDefined();
		});

		it("should handle null and undefined", () => {
			const normalizedNull = normalizeError(null);
			const normalizedUndefined = normalizeError(undefined);

			expect(normalizedNull.message).toContain("Unknown error");
			expect(normalizedUndefined.message).toContain("Unknown error");
		});
	});
});
