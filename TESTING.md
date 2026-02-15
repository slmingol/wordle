# Testing Documentation

This document describes the testing infrastructure and practices for the Wordle+ project.

## Testing Stack

- **[Vitest](https://vitest.dev/)** - Fast unit test framework (Vite-native)
- **[@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/)** - Component testing utilities
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** - Custom DOM matchers
- **[jsdom](https://github.com/jsdom/jsdom)** - DOM implementation for Node.js
- **[@vitest/coverage-v8](https://vitest.dev/guide/coverage.html)** - Code coverage reporting
- **[@vitest/ui](https://vitest.dev/guide/ui.html)** - Visual test UI

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Coverage

Coverage requirements are set in [vitest.config.ts](vitest.config.ts):
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

View coverage reports in `coverage/index.html` after running `npm run test:coverage`.

## Project Structure

```
src/
├── test/
│   ├── setup.ts           # Global test setup and mocks
│   └── helpers.ts         # Test helper utilities
├── *.test.ts              # Unit tests (co-located with source)
└── components/
    └── *.test.ts          # Component tests
```

## Writing Tests

### Unit Tests

Create test files next to the source file with `.test.ts` extension:

```typescript
// src/myModule.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myModule', () => {
  describe('myFunction', () => {
    it('should do something', () => {
      const result = myFunction('input');
      expect(result).toBe('expected output');
    });

    it('should handle edge cases', () => {
      expect(myFunction(null)).toBe(null);
    });
  });
});
```

### Component Tests

Use Testing Library for component tests:

```typescript
// src/components/MyComponent.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '../test/helpers';
import { screen } from '@testing-library/svelte';
import MyComponent from './MyComponent.svelte';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(MyComponent, { prop: 'value' });
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const { component } = render(MyComponent);
    const button = screen.getByRole('button');
    
    await button.click();
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Test Utilities

### Helpers (`src/test/helpers.ts`)

- **`render(component, props)`** - Render Svelte component with props
- **`waitFor(callback, timeout)`** - Wait for async condition
- **`mockLocalStorage()`** - Mock localStorage with spies
- **`mockFetchResponse(data, ok, status)`** - Create mock fetch response
- **`typeText(element, text)`** - Simulate user typing

### Global Setup (`src/test/setup.ts`)

Automatically mocked in all tests:
- `localStorage` and `sessionStorage`
- `matchMedia`
- `IntersectionObserver`
- `ResizeObserver`

## Testing Patterns

### Testing localStorage

```typescript
it('should save to localStorage', () => {
  safeSetItem('key', 'value');
  expect(localStorage.getItem('key')).toBe('value');
});

it('should handle localStorage errors', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new Error('QuotaExceededError');
  });
  
  // Should not throw
  safeSetItem('key', 'value');
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const promise = asyncFunction();
  await expect(promise).resolves.toBe('success');
});

it('should handle errors', async () => {
  await expect(failingFunction()).rejects.toThrow('Error message');
});
```

### Testing Stores

```typescript
import { get } from 'svelte/store';

it('should update store', () => {
  myStore.set('new value');
  expect(get(myStore)).toBe('new value');
});

it('should react to store changes', () => {
  let value;
  const unsubscribe = myStore.subscribe(v => value = v);
  
  myStore.set('updated');
  expect(value).toBe('updated');
  
  unsubscribe();
});
```

### Mocking Functions

```typescript
import { vi } from 'vitest';

it('should call callback', () => {
  const callback = vi.fn();
  functionThatCallsCallback(callback);
  
  expect(callback).toHaveBeenCalled();
  expect(callback).toHaveBeenCalledWith('expected arg');
});
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  // Function that logs errors
  riskyFunction();
  
  expect(consoleError).toHaveBeenCalled();
  consoleError.mockRestore();
});
```

## Current Test Coverage

### Tested Modules

- ✅ **localStorage** (18 tests) - Safe storage operations
- ✅ **validation** (15 tests) - Type guards and validators
- ✅ **helpers** (12 tests) - Utility functions
- ✅ **featureDetection** (12 tests) - Browser feature detection
- ✅ **errorHandling** (13 tests) - Error store and utilities
- ✅ **ErrorNotifications** (4 tests) - Error notification component

### Not Yet Tested

- Game logic (utils.ts)
- Board components
- Keyboard components
- Settings components
- Modal components

## Best Practices

### Do's ✅

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ One assertion concept per test
- ✅ Mock external dependencies
- ✅ Test error cases and edge cases
- ✅ Use `beforeEach` for setup
- ✅ Clean up after tests (clear mocks, stores)

### Don'ts ❌

- ❌ Don't test framework code
- ❌ Don't test third-party libraries
- ❌ Don't make tests dependent on each other
- ❌ Don't test private implementation details
- ❌ Don't skip error case testing
- ❌ Don't use magic numbers/strings

## Debugging Tests

### Run Single Test

```bash
# Run specific file
npx vitest src/helpers.test.ts

# Run tests matching pattern
npx vitest --grep="should handle errors"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Console Logging

```typescript
it('should debug values', () => {
  const value = computeValue();
  console.log('Computed value:', value); // Shows in test output
  expect(value).toBe(expected);
});
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Increase coverage to 80%+
- [ ] Add mutation testing
- [ ] Add performance benchmarks
- [ ] Set up automated coverage reporting
- [ ] Add accessibility testing (axe-core)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Svelte Testing Handbook](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
