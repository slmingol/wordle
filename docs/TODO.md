# TODO

Tracked improvements deferred from audit sessions.

## TypeScript Strictness

**File**: `tsconfig.json`
**Issue**: `strictNullChecks: false` and `noImplicitAny: false` — contradicts "100% type safe" badge
**Fix**: Enable both flags, fix any resulting type errors
**Note**: Run `npm run check` after enabling to see scope of errors before committing

## Vite 6 Upgrade

**File**: `package.json`, `vite.config.js`
**Issue**: On Vite 5.x, Vite 6 is current major
**Fix**: `npm install vite@latest @sveltejs/vite-plugin-svelte@latest` — check breaking changes in Vite 6 migration guide, verify svelte plugin and vitest compat, run full test suite
**Note**: May require updates to `vite.config.js` rollup options and plugin API
