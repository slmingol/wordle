<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import { errorStore } from "../errorHandling";

	let errors: typeof $errorStore.errors = [];

	errorStore.subscribe((state) => {
		errors = state.errors.filter((e) => e.recoverable);
	});

	function dismiss(id: string) {
		errorStore.removeError(id);
	}

	function getSeverityColor(severity: string) {
		switch (severity) {
			case "info":
				return "#3b82f6";
			case "warning":
				return "#f59e0b";
			case "error":
				return "#ef4444";
			case "fatal":
				return "#dc2626";
			default:
				return "#6b7280";
		}
	}
</script>

<div class="error-notifications">
	{#each errors as error (error.id)}
		<div
			class="error-notification"
			style="--severity-color: {getSeverityColor(error.severity)}"
			role="alert"
			transition:fly={{ y: -20, duration: 300 }}
		>
			<div class="error-header">
				<span class="error-severity">{error.severity}</span>
				{#if error.component}
					<span class="error-component">{error.component}</span>
				{/if}
			</div>
			<p class="error-text">{error.message}</p>
			<button class="dismiss-button" on:click={() => dismiss(error.id)} aria-label="Dismiss error">
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.error-notifications {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 400px;
		pointer-events: none;
	}

	.error-notification {
		background: var(--color-background, #121213);
		border-left: 4px solid var(--severity-color);
		padding: 1rem;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		pointer-events: auto;
		position: relative;
	}

	.error-header {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		font-weight: bold;
	}

	.error-severity {
		color: var(--severity-color);
	}

	.error-component {
		color: var(--color-tone-3, #565758);
	}

	.error-text {
		margin: 0;
		color: var(--color-tone-1, #d7dadc);
		font-size: 0.875rem;
		line-height: 1.4;
		padding-right: 1.5rem;
	}

	.dismiss-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: transparent;
		border: none;
		color: var(--color-tone-2, #818384);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.dismiss-button:hover {
		color: var(--color-tone-1, #d7dadc);
	}

	@media (max-width: 600px) {
		.error-notifications {
			left: 1rem;
			right: 1rem;
			max-width: none;
		}
	}
</style>
