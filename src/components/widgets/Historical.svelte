<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { custom_event } from "svelte/internal";
	import type { Toaster } from ".";
	import { GameMode } from "../../enums";
	import { mode } from "../../stores";
	import { getWordNumber, modeData, newSeed } from "../../utils";

	export let showSettings: boolean;
	export let showHistorical: boolean;

	const toaster = getContext<Toaster>("toaster");

	const modes = modeData.modes.map((e) => e.name.toLowerCase());
	let validLink = false;
	let validNumber = false;
	let linkValue = "";
	let numValue = "";
	let linkMode: GameMode;
	let newWordNum: number;
	let currentGameNum = 1;
	let maxGameNum = 1;

	$: maxGameNum = getWordNumber($mode, true) - 1;
	$: currentGameNum = Math.min(currentGameNum, maxGameNum);

	function reset() {
		linkValue = "";
		numValue = "";
		validLink = false;
		validNumber = false;
		currentGameNum = 1;
	}

	function validateNumber(num: number, wordNum: number) {
		if (!isNaN(num) && num > 0 && num < wordNum) {
			newWordNum = num;
			return true;
		}
		return false;
	}

	function validateLink() {
		const data = linkValue
			.slice(linkValue.indexOf("#") + 1)
			.toLowerCase()
			.split("/");
		if (data.length !== 2) return false;
		// Check if mode name is valid
		const modeIndex = modes.indexOf(data[0]);
		if (modeIndex === -1) return false;
		if (!validateNumber(+data[1], getWordNumber(modeIndex, true))) {
			return false;
		}
		linkMode = modeIndex;
		return true;
	}

	function submit(e: MouseEvent | KeyboardEvent) {
		if (!validLink && !validNumber) return;
		const newMode = validNumber ? $mode : linkMode;
		const currentModeData = modeData.modes[newMode];

		currentModeData.historical = true;
		currentModeData.seed = newSeed(
			$mode,
			(newWordNum - 1) * currentModeData.unit + currentModeData.start
		);
		mode.set(newMode, true);

		e.currentTarget.dispatchEvent(custom_event("close", null, { bubbles: true }));
		showSettings = false;
		showHistorical = false;
		toaster.pop(`${GameMode[$mode]} wordle #${newWordNum}`, 2);
		reset();
	}
	
	mode.subscribe(() => {
		if (!showSettings) {
			reset();
		}
	});

	function onInput(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
			submit(e);
		}
	}

	function navigateBackward() {
		if (currentGameNum > 1) {
			currentGameNum--;
			numValue = String(currentGameNum);
			validNumber = validateNumber(+numValue, getWordNumber($mode, true));
		}
	}

	function navigateForward() {
		if (currentGameNum < maxGameNum) {
			currentGameNum++;
			numValue = String(currentGameNum);
			validNumber = validateNumber(+numValue, getWordNumber($mode, true));
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			navigateBackward();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			navigateForward();
		}
	}

	onMount(() => {
		window.addEventListener("keydown", handleKeydown);
		return () => {
			window.removeEventListener("keydown", handleKeydown);
		};
	});
</script>

<h3>Play a historical game</h3>
{#key $mode}
	<form>
		<input
			type="text"
			bind:value={linkValue}
			placeholder="Example: {window.location}/1"
			class:valid={validLink}
			on:input={() => (validLink = validateLink())}
			on:keydown={onInput}
		/>
	</form>
{/key}
<div>Paste in a link</div>
<h3>or</h3>
<div class="number">
	<button
		class="arrow-button"
		aria-label="Previous game"
		disabled={currentGameNum <= 1}
		on:click={navigateBackward}
	>
		◀
	</button>
	<form>
		<input
			type="number"
			bind:value={numValue}
			placeholder="Example: 1"
			class:valid={validNumber}
			on:input={() => {
				currentGameNum = +numValue || 1;
				validNumber = validateNumber(+numValue, getWordNumber($mode, true));
			}}
			on:keydown={onInput}
		/>
	</form>
	<button
		class="arrow-button"
		aria-label="Next game"
		disabled={currentGameNum >= maxGameNum}
		on:click={navigateForward}
	>
		▶
	</button>
	<select bind:value={$mode}>
		{#each modes as mode, i}
			<option value={i}>{mode}</option>
		{/each}
	</select>
</div>
<div>Enter a game number between 1 and {getWordNumber($mode, true) - 1}</div>
<div
	role="button"
	tabindex="0"
	aria-label="Load historical game"
	class:disabled={!validLink && !validNumber}
	class="button"
	on:click={submit}
	on:keydown={submit}
>
	play
</div>

<style lang="scss">
	div {
		text-align: center;
		margin-top: 0.4rem;
	}
	input {
		text-align: center;
		color: inherit;
		font-size: inherit;
		width: 100%;
		height: 100%;
		border-radius: 4px;
		background-color: var(--border-secondary);
		border: none;
		padding: 0.5rem;
		outline: solid 1px var(--red);
	}
	input:placeholder-shown {
		outline: none;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type="number"] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
	.valid {
		outline-color: var(--color-correct);
	}
	select {
		display: inline;
		background: var(--border-secondary);
	}
	.number {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		form {
			flex: 1;
		}
	}
	.arrow-button {
		background-color: var(--color-correct);
		border: none;
		border-radius: 4px;
		color: var(--color-tone-1);
		font-size: 1.2rem;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		transition: opacity 0.15s ease;
		min-width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		&:hover:not(:disabled) {
			opacity: 0.8;
		}
		&:disabled {
			background-color: var(--fg-secondary);
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
	.button {
		background-color: var(--color-correct);
	}
	.disabled {
		background-color: var(--fg-secondary);
		cursor: default;
		pointer-events: none;
		&:hover {
			opacity: 1;
		}
	}
</style>
