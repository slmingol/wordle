import { defineConfig } from "vitest/config";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		svelte({
			hot: !process.env.VITEST,
			preprocess: vitePreprocess(),
		}),
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{js,ts}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/dist/**",
				"**/coverage/**",
				"src/main.ts",
				"src/vite-env.d.ts",
				"scripts/",
			],
			all: true,
			lines: 70,
			functions: 70,
			branches: 70,
			statements: 70,
		},
		css: true,
		// Mock localStorage
		mockReset: true,
		restoreMocks: true,
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
