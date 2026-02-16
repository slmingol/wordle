import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	safeGetItem,
	safeSetItem,
	safeRemoveItem,
	safeClear,
	safeGetJSON,
	safeSetJSON,
} from "./localStorage";

describe("localStorage utilities", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	describe("safeGetItem", () => {
		it("should retrieve item from localStorage", () => {
			localStorage.setItem("test", "value");
			expect(safeGetItem("test")).toBe("value");
		});

		it("should return null for non-existent key", () => {
			expect(safeGetItem("nonexistent")).toBeNull();
		});

		it("should handle localStorage errors gracefully", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const originalGetItem = localStorage.getItem;
			localStorage.getItem = vi.fn(() => {
				throw new Error("Storage error");
			});

			const result = safeGetItem("test");
			expect(result).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalled();

			localStorage.getItem = originalGetItem;
			consoleErrorSpy.mockRestore();
		});
	});

	describe("safeSetItem", () => {
		it("should store item in localStorage", () => {
			safeSetItem("test", "value");
			expect(localStorage.getItem("test")).toBe("value");
		});

		it("should handle localStorage errors gracefully", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const originalSetItem = localStorage.setItem;
			localStorage.setItem = vi.fn(() => {
				throw new Error("QuotaExceededError");
			});

			safeSetItem("test", "value");
			expect(consoleErrorSpy).toHaveBeenCalled();

			localStorage.setItem = originalSetItem;
			consoleErrorSpy.mockRestore();
		});
		it("should store numbers as strings", () => {
			safeSetItem("number", 42);
			expect(localStorage.getItem("number")).toBe("42");
		});
	});

	describe("safeRemoveItem", () => {
		it("should remove item from localStorage", () => {
			localStorage.setItem("test", "value");
			safeRemoveItem("test");
			expect(localStorage.getItem("test")).toBeNull();
		});

		it("should handle errors gracefully", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const originalRemoveItem = localStorage.removeItem;
			localStorage.removeItem = vi.fn(() => {
				throw new Error("Storage error");
			});

			safeRemoveItem("test");
			expect(consoleErrorSpy).toHaveBeenCalled();

			localStorage.removeItem = originalRemoveItem;
			consoleErrorSpy.mockRestore();
		});
	});

	describe("safeClear", () => {
		it("should clear all localStorage items", () => {
			localStorage.setItem("test1", "value1");
			localStorage.setItem("test2", "value2");
			safeClear();
			expect(localStorage.length).toBe(0);
		});

		it("should handle errors gracefully", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const originalClear = localStorage.clear;
			localStorage.clear = vi.fn(() => {
				throw new Error("Storage error");
			});

			safeClear();
			expect(consoleErrorSpy).toHaveBeenCalled();

			localStorage.clear = originalClear;
			consoleErrorSpy.mockRestore();
		});
	});

	describe("safeGetJSON", () => {
		it("should parse valid JSON from localStorage", () => {
			const data = { foo: "bar", count: 42 };
			localStorage.setItem("json", JSON.stringify(data));

			const result = safeGetJSON("json");
			expect(result).toEqual(data);
		});

		it("should return null for invalid JSON", () => {
			localStorage.setItem("invalid", "not json");
			const result = safeGetJSON("invalid");
			expect(result).toBeNull();
		});

		it("should return null for non-existent key", () => {
			const result = safeGetJSON("nonexistent");
			expect(result).toBeNull();
		});

		it("should use validator if provided", () => {
			const data = { name: "test", age: 30 };
			localStorage.setItem("validated", JSON.stringify(data));

			const validator = (value: unknown): value is typeof data => {
				return (
					typeof value === "object" &&
					value !== null &&
					"name" in value &&
					typeof (value as Record<string, unknown>).name === "string"
				);
			};

			const result = safeGetJSON("validated", validator);
			expect(result).toEqual(data);
		});

		it("should return null if validator fails", () => {
			localStorage.setItem("invalid-data", JSON.stringify({ wrong: "structure" }));

			const validator = (value: unknown): value is { required: string } => {
				return (
					typeof value === "object" &&
					value !== null &&
					"required" in value &&
					typeof (value as Record<string, unknown>).required === "string"
				);
			};

			const result = safeGetJSON("invalid-data", validator);
			expect(result).toBeNull();
		});
	});

	describe("safeSetJSON", () => {
		it("should stringify and store object in localStorage", () => {
			const data = { foo: "bar", count: 42 };
			safeSetJSON("json", data);

			const stored = localStorage.getItem("json");
			expect(stored).toBe(JSON.stringify(data));
		});

		it("should handle complex nested objects", () => {
			const data = {
				name: "test",
				nested: {
					array: [1, 2, 3],
					obj: { key: "value" },
				},
			};

			safeSetJSON("complex", data);
			const stored = JSON.parse(localStorage.getItem("complex")!);
			expect(stored).toEqual(data);
		});

		it("should handle errors gracefully", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const originalSetItem = localStorage.setItem;
			localStorage.setItem = vi.fn(() => {
				throw new Error("Storage error");
			});

			safeSetJSON("test", { data: "value" });
			expect(consoleErrorSpy).toHaveBeenCalled();

			localStorage.setItem = originalSetItem;
			consoleErrorSpy.mockRestore();
		});
	});
});
