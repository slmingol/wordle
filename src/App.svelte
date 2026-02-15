<script context="module" lang="ts">
	import {
		modeData,
		seededRandomInt,
		Stats,
		GameState,
		Settings,
		LetterStates,
		getWordNumber,
		words,
	} from "./utils";
	import Game from "./components/Game.svelte";
	import { letterStates, settings, mode } from "./stores";
	import { GameMode } from "./enums";
	import { Toaster, CookieConsent } from "./components/widgets";
	import ErrorBoundary from "./components/ErrorBoundary.svelte";
	import ErrorNotifications from "./components/ErrorNotifications.svelte";
	import { setContext } from "svelte";
	import { safeGetItem, safeSetItem } from "./localStorage";

	document.title = "Wordle+ | An infinite word guessing game";
</script>

<script lang="ts">
	export let version: string;
	setContext("version", version);
	safeSetItem("version", version);
	let stats: Stats;
	let word: string;
	let state: GameState;
	let toaster: Toaster;

	settings.set(new Settings(safeGetItem("settings")));
	settings.subscribe((s) => safeSetItem("settings", JSON.stringify(s)));

	const hash = window.location.hash.slice(1).split("/");
	const modeVal: GameMode = !isNaN(GameMode[hash[0]])
		? GameMode[hash[0]]
		: +(safeGetItem("mode") || modeData.default);
	mode.set(modeVal);
	// If this is a link to a specific word make sure that that is the word
	if (!isNaN(+hash[1]) && +hash[1] < getWordNumber(modeVal)) {
		modeData.modes[modeVal].seed =
			(+hash[1] - 1) * modeData.modes[modeVal].unit + modeData.modes[modeVal].start;
		modeData.modes[modeVal].historical = true;
	}
	mode.subscribe((m) => {
		safeSetItem("mode", `${m}`);
		window.location.hash = GameMode[m];
		stats = new Stats(safeGetItem(`stats-${m}`) || m);
		word = words.words[seededRandomInt(0, words.words.length, modeData.modes[m].seed)];
		if (modeData.modes[m].historical) {
			state = new GameState(m, safeGetItem(`state-${m}-h`));
		} else {
			state = new GameState(m, safeGetItem(`state-${m}`));
		}
		// Set the letter states when data for a new game mode is loaded so the keyboard is correct
		letterStates.set(new LetterStates(state.board));
	});

	$: saveState(state);
	function saveState(state: GameState) {
		if (modeData.modes[$mode].historical) {
			safeSetItem(`state-${$mode}-h`, state.toString());
		} else {
			safeSetItem(`state-${$mode}`, state.toString());
		}
	}
</script>

<ErrorNotifications />
<CookieConsent />
<Toaster bind:this={toaster} />
{#if toaster}
	<ErrorBoundary>
		<Game {stats} bind:word {toaster} bind:game={state} />
	</ErrorBoundary>
{/if}
