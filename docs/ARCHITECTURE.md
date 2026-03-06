# Architecture Documentation

This document describes the architecture, design patterns, and technical decisions in the Wordle+ project.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Architecture](#core-architecture)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Performance Optimizations](#performance-optimizations)
- [Error Handling](#error-handling)
- [Browser Compatibility](#browser-compatibility)
- [Build & Deployment](#build--deployment)

## Overview

Wordle+ is a progressive web application (PWA) built with Svelte and TypeScript. The architecture emphasizes:

- **Performance**: Code splitting, lazy loading, compression
- **Reliability**: Comprehensive error handling, graceful degradation
- **Maintainability**: TypeScript, testing, clear separation of concerns
- **User Experience**: Offline support, responsive design, accessibility

## Technology Stack

### Core Framework
- **Svelte 4.2.19** - Reactive UI framework
- **TypeScript 5.7.2** - Type-safe JavaScript
- **Vite 5.4.18** - Build tool and dev server

### Styling
- **SCSS** - CSS preprocessing
- **CSS Custom Properties** - Dynamic theming

### State Management
- **Svelte Stores** - Reactive state management
- **localStorage** - Persistent state

### Testing
- **Vitest 4.0.18** - Unit testing framework
- **Testing Library** - Component testing
- **jsdom** - DOM environment for tests

### Build & Optimization
- **Terser** - JavaScript minification
- **vite-plugin-compression** - Gzip/Brotli compression
- **Rollup** - Module bundling (via Vite)

### Development Tools
- **ESLint 9** - Code linting
- **Prettier 3** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

## Project Structure

```
wordle/
├── public/                    # Static assets served as-is
│   ├── img/                  # Images, icons, favicons
│   ├── global.css            # Global styles (theme, variables)
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker (offline support)
│
├── src/
│   ├── components/           # Svelte components
│   │   ├── board/           # Game board components
│   │   │   ├── Board.svelte
│   │   │   ├── Row.svelte
│   │   │   └── Tile.svelte
│   │   ├── keyboard/        # Virtual keyboard
│   │   │   ├── Keyboard.svelte
│   │   │   └── Key.svelte
│   │   ├── settings/        # Settings panel
│   │   │   ├── Settings.svelte
│   │   │   ├── SettingsLazy.svelte  # Lazy-loaded wrapper
│   │   │   └── Switch.svelte
│   │   └── widgets/         # Reusable UI components
│   │       ├── Modal.svelte
│   │       ├── Toaster.svelte
│   │       ├── Definition.svelte
│   │       ├── CookieConsent.svelte
│   │       ├── ErrorBoundary.svelte
│   │       └── ErrorNotifications.svelte
│   │
│   ├── test/                 # Test utilities
│   │   ├── setup.ts         # Global test setup
│   │   └── helpers.ts       # Test helper functions
│   │
│   ├── App.svelte            # Root component
│   ├── main.ts               # Application entry point
│   ├── utils.ts              # Core game logic
│   ├── stores.ts             # Svelte stores
│   ├── enums.ts              # Enumerations
│   ├── types.d.ts            # TypeScript type definitions
│   ├── words_5.ts            # Word list (5-letter words)
│   │
│   ├── localStorage.ts       # Safe localStorage utilities
│   ├── validation.ts         # Type guards & validators
│   ├── helpers.ts            # Utility functions
│   ├── performance.ts        # Performance optimizations
│   ├── errorHandling.ts      # Error management
│   ├── featureDetection.ts   # Browser compatibility checks
│   ├── polyfills.ts          # Browser polyfills
│   │
│   └── *.test.ts             # Test files (co-located)
│
├── scripts/
│   └── inject-version.js     # Version injection for SW
│
├── dist/                      # Build output (gitignored)
│
└── Configuration files
    ├── vite.config.js        # Vite build configuration
    ├── vitest.config.ts      # Test configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── eslint.config.cjs     # ESLint configuration
    ├── .prettierrc.json      # Prettier configuration
    └── .browserslistrc       # Target browsers
```

## Core Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         UI Components Layer         │  Svelte components
│  (Board, Keyboard, Settings, etc.)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Application Logic Layer        │  Game logic, state
│   (utils.ts, stores.ts, enums.ts)   │  management
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Utility Services Layer        │  localStorage, error
│  (helpers, validation, errorMgmt)   │  handling, features
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Browser APIs & Polyfills       │  DOM, Storage, Fetch
│    (polyfills.ts, native APIs)      │
└─────────────────────────────────────┘
```

### Module Dependencies

```
App.svelte
  ├─> Game.svelte
  │     ├─> Board.svelte
  │     │     └─> Row.svelte
  │     │           └─> Tile.svelte
  │     ├─> Keyboard.svelte
  │     │     └─> Key.svelte
  │     └─> Header.svelte
  ├─> SettingsLazy.svelte (lazy)
  ├─> TutorialLazy.svelte (lazy)
  ├─> StatisticsLazy.svelte (lazy)
  ├─> ErrorBoundary.svelte
  └─> ErrorNotifications.svelte

Stores (stores.ts)
  ├─> letterStates (keyboard highlighting)
  ├─> settings (user preferences)
  └─> mode (game mode: daily/hourly/infinite)

Utils (utils.ts)
  ├─> GameState (current game state)
  ├─> Stats (player statistics)
  ├─> LetterStates (letter color states)
  └─> Game logic functions
```

## State Management

### Svelte Stores

Global reactive state using Svelte's built-in store system:

```typescript
// stores.ts
import { writable } from 'svelte/store';

export const letterStates = writable<LetterStates>(new LetterStates());
export const settings = writable<Settings>(new Settings());
export const mode = writable<GameMode>(GameMode.daily);
```

**Usage in components:**
```svelte
<script lang="ts">
  import { letterStates } from './stores';
  
  // Subscribe with $
  $: keyColor = $letterStates.get(letter);
</script>
```

### localStorage Persistence

State is persisted to localStorage for:
- Game progress (current game state)
- Statistics (wins, losses, streaks)
- Settings (theme, hard mode, etc.)
- Game mode preference

**Safe localStorage wrapper:**
```typescript
// All localStorage operations wrapped in try-catch
safeSetItem('state-daily', gameState.toString());
const saved = safeGetItem('state-daily');
```

### Error Store

Centralized error management:

```typescript
// errorHandling.ts
export const errorStore = createErrorStore();

// Add error
errorStore.addError('Network request failed', 'error');

// Clear errors
errorStore.clearErrors();
```

## Component Architecture

### Component Hierarchy

```
App (Root)
└─> ErrorBoundary
    └─> Game (Main game logic)
        ├─> Header
        ├─> Board
        │   └─> Row (x6)
        │       └─> Tile (x5)
        ├─> Keyboard
        │   └─> Key (x26)
        └─> Modals (lazy-loaded)
            ├─> Settings
            ├─> Statistics
            └─> Tutorial
```

### Component Patterns

**1. Container/Presentational Pattern**

```svelte
<!-- Container: Game.svelte -->
<script lang="ts">
  let gameState: GameState;
  let stats: Stats;
  
  function handleGuess(word: string) {
    // Business logic
  }
</script>

<Board {gameState} on:guess={handleGuess} />
```

**2. Lazy Loading Pattern**

```svelte
<!-- SettingsLazy.svelte -->
<script lang="ts">
  export let visible: boolean;
  
  let SettingsComponent;
  
  $: if (visible && !SettingsComponent) {
    import('./Settings.svelte').then(m => {
      SettingsComponent = m.default;
    });
  }
</script>

{#if SettingsComponent}
  <svelte:component this={SettingsComponent} />
{/if}
```

**3. Error Boundary Pattern**

```svelte
<!-- ErrorBoundary.svelte -->
<script lang="ts">
  import { handleError } from '../errorHandling';
  
  let hasError = false;
  
  function captureError(error: Error) {
    hasError = true;
    handleError(error);
  }
</script>

{#if hasError}
  <div class="error-fallback">
    <!-- Error UI -->
  </div>
{:else}
  <slot />
{/if}
```

## Data Flow

### Game Flow

```
User Input
    │
    ▼
Keyboard Component
    │
    ▼
Game Logic (utils.ts)
    │
    ├─> Validate guess
    ├─> Update board state
    ├─> Calculate letter states
    ├─> Check win/loss
    └─> Update statistics
    │
    ▼
Update Stores
    │
    ├─> letterStates (for keyboard)
    ├─> gameState (for board)
    └─> stats (for modal)
    │
    ▼
Persist to localStorage
    │
    ▼
Re-render Components
```

### State Update Flow

```typescript
// 1. User action
keyboard.dispatchEvent('keydown', { key: 'A' });

// 2. Event handler
function handleKey(key: string) {
  gameState.addLetter(key);
}

// 3. State update
gameState.board.words[currentRow] += letter;

// 4. Store update (if applicable)
letterStates.set(new LetterStates(gameState.board));

// 5. Persist
safeSetItem('state-daily', gameState.toString());

// 6. Reactive re-render (automatic via Svelte)
```

## Performance Optimizations

### Code Splitting

**Manual Chunks (vite.config.js):**
```javascript
manualChunks: {
  'vendor': ['svelte', 'svelte/store', 'svelte/transition'],
  'words': ['./src/words_5.ts'],
}
```

**Result:**
- Main bundle: 93 KB → 25 KB (Brotli)
- Vendor chunk: 13 KB → 5 KB (Brotli)
- Words chunk: 104 KB → 21 KB (Brotli)

### Lazy Loading

Modals are lazy-loaded on first open:
```typescript
const { lazyLoad } = await import('./performance');
const Settings = await lazyLoad(() => import('./Settings.svelte'));
```

### Memoization

Expensive computations are memoized:
```typescript
const memoizedFunction = memoize((input) => {
  // Expensive calculation
  return result;
});
```

### Compression

Dual compression strategy:
- **Gzip**: Universal browser support
- **Brotli**: 20-25% better compression

### Asset Optimization

- Small assets (<4KB) inlined as base64
- Images optimized and served via CDN
- Critical CSS preloaded
- DNS prefetch for external APIs

## Error Handling

### Multi-Layer Error Handling

**1. Global Error Handlers**
```typescript
// Catches unhandled promise rejections
window.addEventListener('unhandledrejection', handleError);

// Catches uncaught errors
window.addEventListener('error', handleError);
```

**2. Error Boundaries**
```svelte
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**3. Try-Catch Wrappers**
```typescript
export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    handleError(error);
    return { success: false, error };
  }
}
```

**4. Safe Utilities**
```typescript
// All localStorage calls wrapped
safeGetItem(key);  // Never throws
safeSetItem(key, value);  // Never throws
```

### Error Severity Levels

- **info**: Informational (blue)
- **warning**: Recoverable warnings (orange)
- **error**: Errors impacting functionality (red)
- **fatal**: Critical errors (red, requires action)

## Browser Compatibility

### Target Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills

Included in `polyfills.ts`:
- Promise.finally()
- Object.fromEntries()
- Array.prototype.at()
- String.prototype.replaceAll()
- AbortController
- CSS.supports()

### Feature Detection

Runtime checks for:
- localStorage/sessionStorage
- Service Workers
- Fetch API
- ES6 features
- CSS features (Grid, Flexbox, Custom Properties)

## Build & Deployment

### Build Process

```bash
npm run build
```

**Steps:**
1. TypeScript compilation
2. Svelte component compilation
3. CSS processing (SCSS → CSS)
4. JavaScript bundling & code splitting
5. Minification (Terser, 2-pass)
6. Compression (Gzip + Brotli)
7. Version injection into service worker
8. Asset fingerprinting

### Build Output

```
dist/
├── index.html                    # Entry HTML
├── index-v1.5.2.js              # Main bundle
├── index-v1.5.2.js.br           # Brotli compressed
├── index-v1.5.2.js.gz           # Gzip compressed
├── index-v1.5.2.css             # Main styles
├── Settings-v1.5.2.css          # Settings styles
├── assets/
│   ├── vendor-[hash].js         # Framework code
│   ├── words-[hash].js          # Word list
│   ├── Statistics-[hash].js     # Lazy chunk
│   ├── Tutorial-[hash].js       # Lazy chunk
│   └── Settings-[hash].js       # Lazy chunk
├── img/                          # Images
├── manifest.json                 # PWA manifest
└── sw.js                         # Service worker
```

### Progressive Web App

**Service Worker Features:**
- Offline support
- Asset caching
- Background sync
- Install prompt

**PWA Capabilities:**
- Installable on desktop/mobile
- Standalone window
- Splash screen
- Home screen icon

### Deployment

Deployed to GitHub Pages via GitHub Actions:
1. Push to main branch
2. GitHub Action triggers
3. Build process runs
4. Deploy to gh-pages branch
5. Live at https://mikhad.github.io/wordle/

## Design Decisions

### Why Svelte?

- **Performance**: Compiles to vanilla JS, no runtime overhead
- **Simplicity**: Less boilerplate than React/Vue
- **Reactivity**: Built-in reactive programming
- **Size**: Smaller bundle sizes

### Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better developer experience
- **Refactoring**: Safer code refactoring
- **Documentation**: Types serve as documentation

### Why Vite?

- **Speed**: Fast dev server with HMR
- **Modern**: ES modules, native TypeScript
- **Optimized**: Built-in optimizations
- **Simple**: Less configuration

### Why localStorage?

- **Simplicity**: No backend needed
- **Privacy**: Data stays on device
- **Performance**: Instant access
- **Reliability**: No network dependency

## Future Architecture Improvements

- [ ] Migrate to SvelteKit for SSR/SSG
- [ ] Add IndexedDB for larger data
- [ ] Implement virtual scrolling for large lists
- [ ] Add Web Workers for game logic
- [ ] Implement server-side validation
- [ ] Add real-time multiplayer mode
- [ ] Migrate to Svelte 5 (runes)
