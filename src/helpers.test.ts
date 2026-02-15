import { describe, it, expect } from "vitest";
import { debounce, deepClone, arraysEqual } from "./helpers";

describe("helper utilities", () => {
	describe("debounce", () => {
		it("should debounce function calls", async () => {
			let callCount = 0;
			const fn = () => {
				callCount++;
			};

			const debounced = debounce(fn, 100);

			// Call multiple times rapidly
			debounced();
			debounced();
			debounced();

			// Should not have been called yet
			expect(callCount).toBe(0);

			// Wait for debounce delay
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Should have been called only once
			expect(callCount).toBe(1);
		});

		it("should pass arguments to debounced function", async () => {
			let receivedArgs: unknown[] = [];
			const fn = (...args: unknown[]) => {
				receivedArgs = args;
			};

			const debounced = debounce(fn, 50);
			debounced("test", 123, true);

			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(receivedArgs).toEqual(["test", 123, true]);
		});

		it("should cancel previous calls", async () => {
			let lastValue = "";
			const fn = (value: string) => {
				lastValue = value;
			};

			const debounced = debounce(fn, 100);

			debounced("first");
			await new Promise((resolve) => setTimeout(resolve, 50));
			debounced("second");
			await new Promise((resolve) => setTimeout(resolve, 50));
			debounced("third");

			await new Promise((resolve) => setTimeout(resolve, 150));

			// Only the last call should have executed
			expect(lastValue).toBe("third");
		});
	});

	describe("deepClone", () => {
		it("should clone primitive values", () => {
			expect(deepClone(42)).toBe(42);
			expect(deepClone("string")).toBe("string");
			expect(deepClone(true)).toBe(true);
			expect(deepClone(null)).toBe(null);
			expect(deepClone(undefined)).toBe(undefined);
		});

		it("should clone simple objects", () => {
			const obj = { a: 1, b: "test", c: true };
			const cloned = deepClone(obj);

			expect(cloned).toEqual(obj);
			expect(cloned).not.toBe(obj); // Different reference
		});

		it("should clone nested objects", () => {
			const obj = {
				level1: {
					level2: {
						level3: {
							value: "deep",
						},
					},
				},
			};

			const cloned = deepClone(obj);

			expect(cloned).toEqual(obj);
			expect(cloned.level1).not.toBe(obj.level1);
			expect(cloned.level1.level2).not.toBe(obj.level1.level2);
		});

		it("should clone arrays", () => {
			const arr = [1, 2, [3, 4, [5, 6]]];
			const cloned = deepClone(arr);

			expect(cloned).toEqual(arr);
			expect(cloned).not.toBe(arr);
			expect(cloned[2]).not.toBe(arr[2]);
		});

		it("should clone objects with arrays", () => {
			const obj = {
				items: [1, 2, 3],
				nested: {
					arr: ["a", "b", "c"],
				},
			};

			const cloned = deepClone(obj);

			expect(cloned).toEqual(obj);
			expect(cloned.items).not.toBe(obj.items);
			expect(cloned.nested.arr).not.toBe(obj.nested.arr);
		});

		it("should handle Date objects", () => {
			const date = new Date("2024-01-01");
			const cloned = deepClone(date);

			expect(cloned).toEqual(date);
			expect(cloned).not.toBe(date);
		});
	});

	describe("arraysEqual", () => {
		it("should return true for equal primitive arrays", () => {
			expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
			expect(arraysEqual(["a", "b"], ["a", "b"])).toBe(true);
			expect(arraysEqual([true, false], [true, false])).toBe(true);
		});

		it("should return false for different length arrays", () => {
			expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
			expect(arraysEqual([1, 2, 3], [1, 2])).toBe(false);
		});

		it("should return false for different content", () => {
			expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
			expect(arraysEqual(["a", "b"], ["a", "c"])).toBe(false);
		});

		it("should return true for empty arrays", () => {
			expect(arraysEqual([], [])).toBe(true);
		});

		it("should return false for different order", () => {
			expect(arraysEqual([1, 2, 3], [3, 2, 1])).toBe(false);
		});

		it("should handle nested arrays", () => {
			expect(
				arraysEqual(
					[
						[1, 2],
						[3, 4],
					],
					[
						[1, 2],
						[3, 4],
					]
				)
			).toBe(true);
			expect(
				arraysEqual(
					[
						[1, 2],
						[3, 4],
					],
					[
						[1, 2],
						[3, 5],
					]
				)
			).toBe(false);
		});
	});
});
