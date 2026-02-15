#!/usr/bin/env node
/**
 * Injects the version number from package.json into the service worker file.
 * This ensures the service worker always uses the correct version for cache busting.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Read package.json to get version
const packageJson = JSON.parse(
  readFileSync(join(projectRoot, 'package.json'), 'utf-8')
);
const version = packageJson.version;

// Read service worker file
const swPath = join(projectRoot, 'dist/sw.js');
let swContent = readFileSync(swPath, 'utf-8');

// Replace the version placeholder
swContent = swContent.replace(
  /const version = "[^"]+";/,
  `const version = "${version}";`
);

// Write back to file
writeFileSync(swPath, swContent, 'utf-8');

console.log(`✓ Injected version ${version} into service worker`);
