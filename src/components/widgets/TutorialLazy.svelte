<script lang="ts">
	import { onMount } from "svelte";
	import type Tutorial from "./Tutorial.svelte";

	export let visible: boolean;

	let Component: typeof Tutorial | null = null;

	onMount(async () => {
		if (visible) {
			const module = await import("./Tutorial.svelte");
			Component = module.default;
		}
	});

	$: if (visible && !Component) {
		import("./Tutorial.svelte").then((module) => {
			Component = module.default;
		});
	}
</script>

{#if Component}
	<svelte:component this={Component} {...$$props} />
{/if}
