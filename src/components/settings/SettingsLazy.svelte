<script lang="ts">
	import { onMount } from "svelte";
	import type Settings from "./Settings.svelte";

	export let visible: boolean = false;

	let Component: typeof Settings | null = null;

	onMount(async () => {
		if (visible) {
			const module = await import("./Settings.svelte");
			Component = module.default;
		}
	});

	$: if (visible && !Component) {
		import("./Settings.svelte").then((module) => {
			Component = module.default;
		});
	}
</script>

{#if Component}
	<svelte:component this={Component} {...$$props} on:historical />
{/if}
