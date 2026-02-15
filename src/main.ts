//! IF ANYTHING IN THIS FILE IS CHANGED MAKE SURE THE BUILD PROCESS IS UPDATED
// Load polyfills first
import "./polyfills";

import App from "./App.svelte";
import { version } from "./version";
import { setupGlobalErrorHandlers } from "./errorHandling";
import {
	isBrowserSupported,
	showUnsupportedBrowserWarning,
	logFeatureSupport,
} from "./featureDetection";

// Check browser support
if (!isBrowserSupported()) {
	showUnsupportedBrowserWarning();
	// Still try to run the app, but warn the user
}

// Log feature support in development
if (import.meta.env.DEV) {
	logFeatureSupport();
}

// Setup global error handlers
setupGlobalErrorHandlers();

const app = new App({
	target: document.body,
	props: {
		version,
	},
});

export default app;
