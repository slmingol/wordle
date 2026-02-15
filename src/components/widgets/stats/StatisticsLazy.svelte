<script lang="ts">
	import { onMount } from "svelte";
	import type Statistics from "./Statistics.svelte";

	export let visible: boolean;

	let Component: typeof Statistics | null = null;

	onMount(async () => {
		if (visible) {
			const module = await import("./Statistics.svelte");
			Component = module.default;
		}
	});

	$: if (visible && !Component) {
		import("./Statistics.svelte").then((module) => {
			Component = module.default;
		});
	}
</script>

{#if Component}
	<svelte:component this={Component} {...$$props} />
{/if}
