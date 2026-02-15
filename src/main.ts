//! IF ANYTHING IN THIS FILE IS CHANGED MAKE SURE THE BUILD PROCESS IS UPDATED
import App from "./App.svelte";
import { version } from "./version";

const app = new App({
	target: document.body,
	props: {
		version,
	}
});

export default app;