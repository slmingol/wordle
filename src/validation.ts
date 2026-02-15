/**
 * Data validation utilities for runtime type checking and input sanitization
 */

/**
 * Type guards for runtime validation
 */

export function isString(value: unknown): value is string {
	return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
	return typeof value === "number" && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
	return Array.isArray(value);
}

/**
 * Validates if a value is a valid GameMode enum
 */
export function isValidGameMode(value: unknown): value is number {
	return isNumber(value) && value >= 0 && value <= 2;
}

/**
 * Validates if a string is a valid 5-letter word (only letters)
 */
export function isValidWord(word: unknown): word is string {
	if (!isString(word)) return false;
	return /^[a-zA-Z]{5}$/.test(word);
}

/**
 * Validates Settings object structure
 */
export interface SettingsData {
	hard: boolean[];
	dark: boolean;
	colorblind: boolean;
	tutorial: 0 | 1 | 2 | 3;
}

export function isValidSettings(value: unknown): value is SettingsData {
	if (!isObject(value)) return false;

	const { hard, dark, colorblind, tutorial } = value;

	return (
		isArray<boolean>(hard) &&
		hard.every((v) => isBoolean(v)) &&
		isBoolean(dark) &&
		isBoolean(colorblind) &&
		isNumber(tutorial) &&
		tutorial >= 0 &&
		tutorial <= 3
	);
}

/**
 * Validates GameState object structure
 */
export interface GameStateData {
	active: boolean;
	guesses: number;
	validHard: boolean;
	time: number;
	wordNumber: number;
	board: {
		words: string[];
		state: string[][];
	};
}

export function isValidGameState(value: unknown): value is GameStateData {
	if (!isObject(value)) return false;

	const { active, guesses, validHard, time, wordNumber, board } = value;

	return (
		isBoolean(active) &&
		isNumber(guesses) &&
		guesses >= 0 &&
		guesses <= 6 &&
		isBoolean(validHard) &&
		isNumber(time) &&
		isNumber(wordNumber) &&
		isObject(board) &&
		isArray<string>(board.words) &&
		isArray(board.state)
	);
}

/**
 * Validates Stats object structure
 */
export interface StatsData {
	played: number;
	lastGame: number;
	guesses: {
		fail: number;
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
		6: number;
	};
	streak?: number;
	maxStreak?: number;
}

export function isValidStats(value: unknown): value is StatsData {
	if (!isObject(value)) return false;

	const { played, lastGame, guesses, streak, maxStreak } = value;

	if (!isNumber(played) || !isNumber(lastGame) || !isObject(guesses)) {
		return false;
	}

	const validGuesses =
		isNumber(guesses.fail) &&
		isNumber(guesses[1]) &&
		isNumber(guesses[2]) &&
		isNumber(guesses[3]) &&
		isNumber(guesses[4]) &&
		isNumber(guesses[5]) &&
		isNumber(guesses[6]);

	if (!validGuesses) return false;

	// streak and maxStreak are optional
	if (streak !== undefined && !isNumber(streak)) return false;
	if (maxStreak !== undefined && !isNumber(maxStreak)) return false;

	return true;
}

/**
 * Sanitize user input string (remove non-letter characters, convert to uppercase)
 */
export function sanitizeWordInput(input: unknown): string {
	if (!isString(input)) return "";
	return input.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

/**
 * Validates and parses JSON safely with type guard
 */
export function parseJSON<T>(
	json: string,
	validator: (value: unknown) => value is T,
	fallback: T
): T {
	try {
		const parsed = JSON.parse(json);
		return validator(parsed) ? parsed : fallback;
	} catch {
		return fallback;
	}
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Validates an array has the expected length
 */
export function hasLength<T>(arr: unknown, length: number): arr is T[] {
	return isArray(arr) && arr.length === length;
}

/**
 * Safe integer conversion with fallback
 */
export function toInteger(value: unknown, fallback: number = 0): number {
	if (isNumber(value)) return Math.floor(value);
	if (isString(value)) {
		const parsed = parseInt(value, 10);
		return isNaN(parsed) ? fallback : parsed;
	}
	return fallback;
}

/**
 * Safe boolean conversion
 */
export function toBoolean(value: unknown): boolean {
	if (isBoolean(value)) return value;
	if (isString(value)) return value.toLowerCase() === "true";
	return Boolean(value);
}
