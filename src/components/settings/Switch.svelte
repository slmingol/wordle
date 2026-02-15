<script lang="ts">
	export let value: boolean;
	export let disabled = false;
</script>

<div role="switch" tabindex="0" aria-checked={value} on:click={() => !disabled && (value = !value)} on:keydown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && (value = !value)} class:checked={value} aria-disabled={disabled} />

<style lang="scss">
	div[disabled="true"] {
		opacity: 0.5;
		cursor: unset;
	}
	div {
		width: 32px;
		height: 20px;
		border-radius: 10px;
		background: var(--icon-color);
		position: relative;
		cursor: pointer;
		transition: background-color 0.3s ease;
		&::before {
			content: "";
			position: absolute;
			width: 16px;
			aspect-ratio: 1;
			background: white;
			border-radius: 50%;
			margin: 2px;
			left: 0;
			transition: left 0.3s ease;
		}
	}
	.checked {
		background: var(--color-correct);
		&::before {
			left: 12px;
		}
	}
</style>
