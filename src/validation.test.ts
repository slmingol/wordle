import { describe, it, expect } from "vitest";
import { isString, isNumber, isBoolean, isObject, isArray } from "./validation";

describe("validation utilities", () => {
	describe("isString", () => {
		it("should return true for strings", () => {
			expect(isString("hello")).toBe(true);
			expect(isString("")).toBe(true);
			expect(isString(String("test"))).toBe(true);
		});

		it("should return false for non-strings", () => {
			expect(isString(42)).toBe(false);
			expect(isString(null)).toBe(false);
			expect(isString(undefined)).toBe(false);
			expect(isString({})).toBe(false);
			expect(isString([])).toBe(false);
			expect(isString(true)).toBe(false);
		});
	});

	describe("isNumber", () => {
		it("should return true for numbers", () => {
			expect(isNumber(42)).toBe(true);
			expect(isNumber(0)).toBe(true);
			expect(isNumber(-1)).toBe(true);
			expect(isNumber(3.14)).toBe(true);
			expect(isNumber(Infinity)).toBe(true);
		});

		it("should return false for NaN", () => {
			expect(isNumber(NaN)).toBe(false);
		});

		it("should return false for non-numbers", () => {
			expect(isNumber("42")).toBe(false);
			expect(isNumber(null)).toBe(false);
			expect(isNumber(undefined)).toBe(false);
			expect(isNumber({})).toBe(false);
			expect(isNumber([])).toBe(false);
		});
	});

	describe("isBoolean", () => {
		it("should return true for booleans", () => {
			expect(isBoolean(true)).toBe(true);
			expect(isBoolean(false)).toBe(true);
			expect(isBoolean(Boolean(1))).toBe(true);
		});

		it("should return false for non-booleans", () => {
			expect(isBoolean(1)).toBe(false);
			expect(isBoolean(0)).toBe(false);
			expect(isBoolean("true")).toBe(false);
			expect(isBoolean(null)).toBe(false);
			expect(isBoolean(undefined)).toBe(false);
		});
	});

	describe("isObject", () => {
		it("should return true for plain objects", () => {
			expect(isObject({})).toBe(true);
			expect(isObject({ key: "value" })).toBe(true);
			expect(isObject(Object.create(null))).toBe(true);
		});

		it("should return false for null", () => {
			expect(isObject(null)).toBe(false);
		});

		it("should return false for arrays", () => {
			expect(isObject([])).toBe(false);
			expect(isObject([1, 2, 3])).toBe(false);
		});

		it("should return false for primitives", () => {
			expect(isObject("string")).toBe(false);
			expect(isObject(42)).toBe(false);
			expect(isObject(true)).toBe(false);
			expect(isObject(undefined)).toBe(false);
		});

		it("should return false for functions", () => {
			// Functions are technically objects in JavaScript, but isObject is for plain objects
			const func = () => {};
			expect(isObject(func)).toBe(false);
		});
	});

	describe("isArray", () => {
		it("should return true for arrays", () => {
			expect(isArray([])).toBe(true);
			expect(isArray([1, 2, 3])).toBe(true);
			expect(isArray(new Array(5))).toBe(true);
		});

		it("should return false for non-arrays", () => {
			expect(isArray({})).toBe(false);
			expect(isArray("array")).toBe(false);
			expect(isArray(null)).toBe(false);
			expect(isArray(undefined)).toBe(false);
			expect(isArray(42)).toBe(false);
		});

		it("should work with Array.isArray", () => {
			const testArray = [1, 2, 3];
			expect(isArray(testArray)).toBe(Array.isArray(testArray));
		});
	});
});
