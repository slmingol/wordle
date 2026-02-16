<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { handleError } from "../errorHandling";

	export let component: string = "Component";
	export let fallback: boolean = true;
	export let showError: boolean = false;

	let hasError = false;
	let errorMessage = "";

	// Catch errors during component initialization
	onMount(() => {
		try {
			// Component mounted successfully
		} catch (e) {
			captureError(e);
		}
	});

	function captureError(e: unknown) {
		hasError = true;
		const errorId = handleError(e, component, "error");

		if (e instanceof Error) {
			errorMessage = e.message;
			error = {
				id: errorId,
				message: e.message,
				stack: e.stack,
				timestamp: Date.now(),
				severity: "error",
				component,
				recoverable: true,
			};
		} else {
			errorMessage = String(e);
			error = {
				id: errorId,
				message: String(e),
				timestamp: Date.now(),
				severity: "error",
				component,
				recoverable: true,
			};
		}
	}

	function retry() {
		hasError = false;
		error = null;
		errorMessage = "";
	}

	onDestroy(() => {
		// Cleanup
	});
</script>

{#if hasError && fallback}
	<div class="error-boundary" role="alert">
		<div class="error-content">
			<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<circle cx="12" cy="12" r="10" stroke-width="2" />
				<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
				<line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
			</svg>
			<h3>Something went wrong</h3>
			{#if showError && errorMessage}
				<p class="error-message">{errorMessage}</p>
			{/if}
			<button class="retry-button" on:click={retry}>Try Again</button>
		</div>
	</div>
{:else if !hasError}
	<slot />
{/if}

<style>
	.error-boundary {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		padding: 2rem;
		background: var(--color-background, #121213);
		border-radius: 8px;
	}

	.error-content {
		text-align: center;
		max-width: 400px;
	}

	.error-icon {
		width: 48px;
		height: 48px;
		color: var(--color-error, #dc2626);
		margin: 0 auto 1rem;
	}

	h3 {
		color: var(--color-tone-1, #d7dadc);
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
	}

	.error-message {
		color: var(--color-tone-2, #818384);
		font-size: 0.875rem;
		margin: 0.5rem 0 1.5rem;
		font-family: monospace;
	}

	.retry-button {
		background: var(--color-correct, #6aaa64);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s;
	}

	.retry-button:hover {
		background: var(--color-correct-hover, #5a9a54);
	}

	.retry-button:active {
		transform: scale(0.98);
	}
</style>
