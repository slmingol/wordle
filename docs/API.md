# API Documentation

This document provides detailed API documentation for utility functions and modules in Wordle+.

## Table of Contents

- [localStorage Module](#localstorage-module)
- [Validation Module](#validation-module)
- [Helpers Module](#helpers-module)
- [Performance Module](#performance-module)
- [Error Handling Module](#error-handling-module)
- [Feature Detection Module](#feature-detection-module)

---

## localStorage Module

Safe wrapper functions for localStorage operations that handle errors gracefully.

**File:** `src/localStorage.ts`

### safeGetItem()

Safely retrieve an item from localStorage.

```typescript
function safeGetItem(key: string): string | null
```

**Parameters:**
- `key` (string): The localStorage key

**Returns:**
- `string | null`: The stored value or null if not found/error

**Example:**
```typescript
const theme = safeGetItem('theme');
if (theme) {
  applyTheme(theme);
}
```

---

### safeSetItem()

Safely store an item in localStorage.

```typescript
function safeSetItem(key: string, value: unknown): void
```

**Parameters:**
- `key` (string): The localStorage key
- `value` (unknown): The value to store (converted to string)

**Example:**
```typescript
safeSetItem('theme', 'dark');
safeSetItem('score', 42);  // Auto-converts to string
```

**Error Handling:**
- Catches QuotaExceededError
- Logs error but doesn't throw
- Silently fails for privacy mode

---

### safeRemoveItem()

Safely remove an item from localStorage.

```typescript
function safeRemoveItem(key: string): void
```

**Parameters:**
- `key` (string): The localStorage key to remove

**Example:**
```typescript
safeRemoveItem('temporary-data');
```

---

### safeClear()

Safely clear all items from localStorage.

```typescript
function safeClear(): void
```

**Example:**
```typescript
// Clear all stored data
safeClear();
```

---

### safeGetJSON()

Retrieve and parse JSON from localStorage with optional validation.

```typescript
function safeGetJSON<T>(
  key: string, 
  validator?: (value: unknown) => value is T
): T | null
```

**Parameters:**
- `key` (string): The localStorage key
- `validator` (optional): Type guard function for validation

**Returns:**
- `T | null`: Parsed and validated object or null

**Example:**
```typescript
interface UserSettings {
  theme: string;
  volume: number;
}

const isUserSettings = (value: unknown): value is UserSettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'theme' in value &&
    'volume' in value
  );
};

const settings = safeGetJSON('settings', isUserSettings);
if (settings) {
  console.log(settings.theme);  // Type-safe!
}
```

---

### safeSetJSON()

Stringify and store an object in localStorage.

```typescript
function safeSetJSON(key: string, value: unknown): void
```

**Parameters:**
- `key` (string): The localStorage key
- `value` (unknown): The object to stringify and store

**Example:**
```typescript
const settings = {
  theme: 'dark',
  notifications: true,
  volume: 0.7
};

safeSetJSON('user-settings', settings);
```

---

## Validation Module

Type guards and validation functions for runtime type checking.

**File:** `src/validation.ts`

### isString()

Check if value is a string.

```typescript
function isString(value: unknown): value is string
```

**Example:**
```typescript
if (isString(input)) {
  console.log(input.toUpperCase());  // Type-safe
}
```

---

### isNumber()

Check if value is a valid number (not NaN).

```typescript
function isNumber(value: unknown): value is number
```

**Example:**
```typescript
if (isNumber(value)) {
  const doubled = value * 2;  // Type-safe
}
```

---

### isBoolean()

Check if value is a boolean.

```typescript
function isBoolean(value: unknown): value is boolean
```

---

### isObject()

Check if value is a plain object (not array, null, or function).

```typescript
function isObject(value: unknown): value is Record<string, unknown>
```

**Example:**
```typescript
if (isObject(data)) {
  Object.keys(data).forEach(key => {
    console.log(key, data[key]);
  });
}
```

---

### isArray()

Check if value is an array.

```typescript
function isArray(value: unknown): value is unknown[]
```

---

### parseJSON()

Safely parse JSON with optional validation.

```typescript
function parseJSON<T>(
  json: string,
  validator?: (value: unknown) => value is T
): T | null
```

**Parameters:**
- `json` (string): JSON string to parse
- `validator` (optional): Type guard for validation

**Returns:**
- `T | null`: Parsed and validated data or null

**Example:**
```typescript
const data = parseJSON(jsonString, isValidGameState);
if (data) {
  // data is type GameState
}
```

---

### sanitizeWordInput()

Sanitize user input for word guesses.

```typescript
function sanitizeWordInput(input: string): string
```

**Parameters:**
- `input` (string): Raw user input

**Returns:**
- `string`: Sanitized uppercase letters only

**Example:**
```typescript
const word = sanitizeWordInput('  HeLLo123!  ');
console.log(word);  // "HELLO"
```

---

### clamp()

Clamp a number between min and max values.

```typescript
function clamp(value: number, min: number, max: number): number
```

**Example:**
```typescript
const volume = clamp(userInput, 0, 1);  // Ensures 0-1 range
```

---

### toInteger()

Safely convert value to integer.

```typescript
function toInteger(value: unknown, fallback: number = 0): number
```

**Parameters:**
- `value` (unknown): Value to convert
- `fallback` (number): Default if conversion fails

**Example:**
```typescript
const count = toInteger(userInput, 0);
```

---

## Helpers Module

Common utility functions used throughout the application.

**File:** `src/helpers.ts`

### debounce()

Create a debounced function that delays execution.

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

**Parameters:**
- `func` (Function): The function to debounce
- `wait` (number): Delay in milliseconds

**Returns:**
- Debounced function

**Example:**
```typescript
const handleSearch = debounce((query: string) => {
  performSearch(query);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

---

### throttle()

Create a throttled function that limits execution rate.

```typescript
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void
```

**Example:**
```typescript
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', handleScroll);
```

---

### deepClone()

Create a deep copy of an object or array.

```typescript
function deepClone<T>(obj: T): T
```

**Example:**
```typescript
const original = { nested: { value: 42 } };
const copy = deepClone(original);
copy.nested.value = 100;
console.log(original.nested.value);  // Still 42
```

---

### arraysEqual()

Check if two arrays are equal (shallow comparison).

```typescript
function arraysEqual<T>(a: T[], b: T[]): boolean
```

**Example:**
```typescript
const same = arraysEqual([1, 2, 3], [1, 2, 3]);  // true
const different = arraysEqual([1, 2], [1, 2, 3]);  // false
```

---

### formatTime()

Format milliseconds into human-readable time.

```typescript
function formatTime(ms: number): string
```

**Example:**
```typescript
formatTime(65000);  // "1:05"
formatTime(3661000);  // "1:01:01"
```

---

### showErrorFeedback()

Display error feedback to user (consolidated pattern).

```typescript
function showErrorFeedback(
  toaster: Toaster,
  board: Board,
  message: string
): void
```

**Parameters:**
- `toaster`: Toaster component instance
- `board`: Board component instance
- `message`: Error message to display

**Example:**
```typescript
if (!isValidWord(guess)) {
  showErrorFeedback(toaster, board, 'Not in word list');
}
```

---

## Performance Module

Performance optimization utilities.

**File:** `src/performance.ts`

### memoize()

Memoize function results for performance.

```typescript
function memoize<T extends (...args: any[]) => any>(
  fn: T
): T
```

**Example:**
```typescript
const expensiveCalc = memoize((n: number) => {
  // Expensive calculation
  return result;
});

expensiveCalc(10);  // Calculates
expensiveCalc(10);  // Returns cached result
```

---

### memoizeWithLimit()

Memoize with cache size limit (LRU).

```typescript
function memoizeWithLimit<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T
```

**Parameters:**
- `fn`: Function to memoize
- `limit`: Maximum cache entries

---

### lazyLoad()

Lazy load a Svelte component.

```typescript
function lazyLoad(
  loader: () => Promise<any>
): Promise<any>
```

**Example:**
```typescript
const Settings = await lazyLoad(
  () => import('./Settings.svelte')
);
```

---

### debouncedWritable()

Create a debounced Svelte store.

```typescript
function debouncedWritable<T>(
  initialValue: T,
  delay: number
): Writable<T>
```

**Example:**
```typescript
const searchQuery = debouncedWritable('', 300);

// Updates are debounced
$searchQuery = 'hello';
```

---

## Error Handling Module

Centralized error management system.

**File:** `src/errorHandling.ts`

### errorStore

Reactive store for error state.

```typescript
interface ErrorState {
  errors: AppError[];
  lastError: AppError | null;
  hasError: boolean;
}

const errorStore: ErrorStore
```

**Methods:**
- `addError(message, severity?, details?): string` - Add error
- `removeError(id: string): void` - Remove error by ID
- `clearErrors(): void` - Clear all errors
- `clearBySeverity(severity): void` - Clear by severity

**Example:**
```typescript
import { errorStore } from './errorHandling';

// Add error
const errorId = errorStore.addError(
  'Failed to save',
  'error',
  { code: 500 }
);

// Subscribe to errors
errorStore.subscribe(state => {
  if (state.hasError) {
    console.log('Last error:', state.lastError);
  }
});

// Clear errors
errorStore.clearErrors();
```

---

### handleError()

Handle and normalize errors.

```typescript
function handleError(
  error: unknown,
  component?: string,
  severity?: AppError['severity']
): void
```

**Example:**
```typescript
try {
  riskyOperation();
} catch (error) {
  handleError(error, 'GameBoard', 'warning');
}
```

---

### tryCatch()

Wrapper for async try-catch.

```typescript
function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T>>
```

**Example:**
```typescript
const result = await tryCatch(async () => {
  return await fetchData();
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

---

### setupGlobalErrorHandlers()

Setup global error handlers.

```typescript
function setupGlobalErrorHandlers(): void
```

**Example:**
```typescript
// In main.ts
setupGlobalErrorHandlers();
```

---

## Feature Detection Module

Browser compatibility and feature detection.

**File:** `src/featureDetection.ts`

### detectFeatures()

Detect all browser features.

```typescript
function detectFeatures(): BrowserFeatures
```

**Returns:**
```typescript
interface BrowserFeatures {
  localStorage: boolean;
  sessionStorage: boolean;
  serviceWorker: boolean;
  fetch: boolean;
  promises: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  webWorkers: boolean;
  es6: boolean;
  css: {
    grid: boolean;
    flexbox: boolean;
    customProperties: boolean;
    backdrop: boolean;
  };
}
```

**Example:**
```typescript
const features = detectFeatures();
if (!features.localStorage) {
  showWarning('localStorage not available');
}
```

---

### isBrowserSupported()

Check if browser meets minimum requirements.

```typescript
function isBrowserSupported(): boolean
```

**Example:**
```typescript
if (!isBrowserSupported()) {
  showUnsupportedBrowserWarning();
}
```

---

### Individual Feature Checks

- `hasLocalStorage(): boolean`
- `hasSessionStorage(): boolean`
- `hasFetch(): boolean`
- `hasPromises(): boolean`
- `hasServiceWorker(): boolean`
- `hasES6(): boolean`
- `hasCSSGrid(): boolean`
- `hasCSSFlexbox(): boolean`
- `hasCSSCustomProperties(): boolean`

---

## Type Definitions

Common types used across modules:

```typescript
// Game types
type LetterState = 'x' | 'c' | 'e' | '🔒';
type GameMode = 'daily' | 'hourly' | 'infinite';

// Error types
interface AppError {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  timestamp: number;
  component?: string;
  stack?: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
}

// Result type
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };
```

---

## Usage Examples

### Complete localStorage Workflow

```typescript
import { safeGetJSON, safeSetJSON } from './localStorage';
import { isValidSettings } from './validation';

// Load settings
const settings = safeGetJSON('user-settings', isValidSettings);

if (settings) {
  applySettings(settings);
} else {
  // Use defaults
  const defaults = getDefaultSettings();
  safeSetJSON('user-settings', defaults);
}
```

### Error Handling Workflow

```typescript
import { errorStore, tryCatch } from './errorHandling';

async function saveGame() {
  const result = await tryCatch(async () => {
    const data = prepareGameData();
    await uploadData(data);
    return data;
  });

  if (result.success) {
    showSuccess('Game saved!');
  } else {
    errorStore.addError(
      'Failed to save game',
      'error',
      { originalError: result.error }
    );
  }
}
```

### Feature Detection Workflow

```typescript
import { isBrowserSupported, hasServiceWorker } from './featureDetection';

if (!isBrowserSupported()) {
  showWarning('Your browser is not fully supported');
}

if (hasServiceWorker()) {
  registerServiceWorker();
} else {
  console.log('Service Worker not available - no offline support');
}
```

---

For more information, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [TESTING.md](TESTING.md) - Testing guidelines
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
