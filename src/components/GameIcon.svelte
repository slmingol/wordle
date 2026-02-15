<script lang="ts">
	export let onClick = () => {};
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	role="button"
	tabindex="0"
	on:click={onClick}
	on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
>
	<slot />
</svg>

<style lang="scss">
	svg {
		cursor: pointer;
		width: 24px;
		margin: 0 4px;
		:global(path) {
			fill: var(--icon-color);
		}
	}
</style>
