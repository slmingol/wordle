# Wordle+ Copilot Instructions

## Project Overview

PWA Wordle game clone with TypeScript/Svelte. ~68 source files, 122 tests, zero ESLint warnings.

**Stack**: Svelte 4.2.19, TypeScript 5.7.2, Vite 5.4.18, Vitest 4.0.18, ESLint 9, Prettier 3, SCSS. **Node**: 20+ required.

## Build Commands (CRITICAL - Follow Order)

```bash
# 1. ALWAYS install first
npm install                  # Runs husky prepare script

# 2. Build (production)
npm run build               # Runs: vite build && inject-version.js
                           # Creates dist/ and injects version into dist/sw.js

# 3. Test (122 tests, ~1-2s)
npm run test:run           # All tests must pass
npm test                   # Watch mode
npm run test:coverage      # Generate coverage (70% threshold)

# 4. Type check
npm run check              # KNOWN ISSUE: 3 Sentry errors in errorTracking.ts
                          # These are type definition issues, build still works

# 5. Lint (MUST be zero warnings)
npm run lint              # Check only
npm run lint:fix          # Auto-fix
npm run format            # Prettier formatting

# 6. Development
npm run dev               # http://localhost:5173 (auto-reload)
npm run preview           # Preview production build
```

**Pre-commit Hook**: Husky runs `lint-staged` (eslint --fix + prettier) on .ts/.svelte files. Failed linting blocks commits.

**Critical**: `npm run build` MUST run both vite build AND inject-version script. Don't run them separately.

## Project Structure

```
.github/workflows/          # publish.yml (GitHub Pages), docker-publish.yml (ghcr.io)
.husky/pre-commit          # Runs lint-staged
docker/                    # Dockerfile, nginx.conf, docker-compose files
docs/                      # 13 .md files: CONTRIBUTING, ARCHITECTURE, TESTING, etc.
public/                    # Static assets: sw.js, manifest.json, global.css, img/
scripts/inject-version.js  # Post-build: injects package.json version into sw.js
src/
  components/              # Board, Keyboard, Settings, Widgets, ErrorBoundary
  test/                    # setup.ts, helpers.ts
  App.svelte, main.ts      # Root component and entry point
  utils.ts                 # Core game logic (word validation, game modes)
  stores.ts                # Svelte reactive state
  enums.ts                 # GameMode, LetterState, GameState
  words_5.ts               # 5-letter word list (~103KB)
  localStorage.ts          # Safe localStorage utilities
  analytics.ts, monitoring.ts, errorTracking.ts, errorHandling.ts
  *.test.ts                # Co-located tests
vite.config.js             # base: '/wordle/', compression, terser
vitest.config.ts           # Coverage thresholds: 70%
eslint.config.cjs          # Flat config format
tsconfig.json              # Extends @tsconfig/svelte
package.json               # Scripts and dependencies
```

**Key Files**:
- `vite.config.js`: Uses `base: "/wordle/"` for GitHub Pages. Change for different deployment.
- `src/utils.ts`: Game logic. To add game mode: update `GameMode` enum, `newSeed()`, `modeData` array.
- `src/errorTracking.ts`: Lines 149, 223, 236 have known Sentry type errors (ignore).
- `public/sw.js`: Service worker for PWA. Version injected by post-build script.

## CI/CD Workflows

**GitHub Pages** (`.github/workflows/publish.yml`): Triggers on push to `main`. Runs `npm i` + `npm run build`, deploys `dist/` to `gh-pages` branch. Uses Node 16 (works fine, but Node 20+ recommended for updates).

**Docker Build** (`.github/workflows/docker-publish.yml`): Triggers on push to `main`, tags `v*`, PRs. Builds multi-platform (linux/amd64, linux/arm64) images to `ghcr.io/slmingol/wordle`.

**Docker Usage**:
```bash
docker-compose --profile dev up              # Dev with hot reload (port 5173)
docker-compose --profile prod up --build     # Production build (port 8080)
docker compose -f docker-compose.simple.yml up  # Pre-built image
```

## Validation Checklist (Before Merge/Deploy)

```bash
npm run lint        # MUST return 0 warnings
npm run test:run    # MUST show 122/122 tests passing
npm run build       # MUST complete without errors
```

Optional: `npm run check` (will show 3 known Sentry errors - ignore), `npm run preview` (test build locally)

## Known Issues & Workarounds

| Issue | Status | Solution |
|-------|--------|----------|
| `svelte-check` shows 3 Sentry type errors (errorTracking.ts:149,223,236) | Known, safe to ignore | Build succeeds. Don't attempt to fix without understanding Sentry integration. |
| Build logs show `dist//Users/...` paths in compression output | Cosmetic | Ignore. Files compress correctly. |
| Tests show stderr warnings (analytics, localStorage) | Expected debug output | Not failures. Part of test coverage. |
| Husky errors during `npm install` | Normal if first install | Run `npm run prepare` if needed, or ignore. |
| `npm audit` shows vulnerabilities | Typical for dev deps | Review significance. Most in ESLint/test tools, not runtime. |

## Making Code Changes

**Components**: `src/components/` - Use TypeScript, avoid `any`, follow existing patterns. Tests co-located.

**Game Logic**: `src/utils.ts` (core), `src/words_5.ts` (word list), `src/stores.ts` (state). Always run `npm run test:run` after changes.

**Styles**: Global in `public/global.css`, component-scoped in `<style lang="scss">` blocks.

**Adding Dependencies**: `npm install <pkg>` or `npm install -D <pkg>`, then verify build works.

**Testing**: Follow patterns in `src/test/helpers.ts`. Use `@testing-library/svelte` for components. Maintain 70% coverage.

## Documentation

Comprehensive docs in `docs/`: CONTRIBUTING.md, ARCHITECTURE.md, TESTING.md, DEPLOYMENT.md, DOCKER.md, API.md, LINTING_AND_LOCALSTORAGE.md, BROWSER_COMPATIBILITY.md, ERROR_HANDLING_TEST.md, MONITORING.md, UPGRADE_NOTES.md.

**Consult these** before making architectural changes.

## Trust These Instructions

This file was created through comprehensive repository analysis including:
- Reading all documentation files
- Testing build, test, and lint commands
- Verifying CI/CD workflows
- Exploring project structure and configuration
- Running validation checks

**When working on this project**: Trust these instructions first. Only search for additional information if these instructions are incomplete or if you encounter errors not documented here.
