<script context="module" lang="ts">
	const cache = new Map<string, Promise<DictionaryEntry>>();

	// Rate limiting: track request timestamps
	const requestTimes: number[] = [];
	const MAX_REQUESTS_PER_MINUTE = 10;
	const REQUEST_TIMEOUT = 8000; // 8 seconds

	function canMakeRequest(): boolean {
		const now = Date.now();
		// Remove timestamps older than 1 minute
		while (requestTimes.length > 0 && now - requestTimes[0] > 60000) {
			requestTimes.shift();
		}
		return requestTimes.length < MAX_REQUESTS_PER_MINUTE;
	}

	function recordRequest() {
		requestTimes.push(Date.now());
	}
</script>

<script lang="ts">
	export let word: string;
	/** The maximum number of alternate definitions to provide*/
	export let alternates = 9;

	async function getWordData(word: string): Promise<DictionaryEntry> {
		if (!cache.has(word)) {
			// Rate limiting check
			if (!canMakeRequest()) {
				throw new Error("Rate limit exceeded. Please wait a moment.");
			}

			recordRequest();

			// Create abort controller for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

			try {
				const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
					mode: "cors",
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (data.ok) {
					cache.set(word, (await data.json())[0]);
				} else if (data.status === 429) {
					throw new Error("Too many requests. Please try again later.");
				} else if (data.status === 404) {
					throw new Error("Definition not found.");
				} else {
					throw new Error(`Failed to fetch definition (${data.status})`);
				}
			} catch (error) {
				clearTimeout(timeoutId);
				if (error.name === "AbortError") {
					throw new Error("Request timed out. Please try again.");
				}
				throw error;
			}
		}
		return cache.get(word);
	}
</script>

<div class="def">
	{#await getWordData(word)}
		<h4>Fetching definition...</h4>
	{:then data}
		<h2>{word}</h2>
		<em>{data.meanings[0].partOfSpeech}</em>
		<ol>
			{#if word !== data.word}
				<li>variant of {data.word}.</li>
			{/if}
			{#each data.meanings[0].definitions.slice(0, 1 + alternates - (word !== data.word ? 1 : 0)) as def}
				<li>{def.definition}</li>
			{/each}
		</ol>
	{:catch error}
		<div class="error">
			Your word was <strong>{word}</strong>.
			<br />
			<span class="error-message">{error?.message || "Failed to fetch definition"}</span>
		</div>
	{/await}
</div>

<style>
	h2 {
		display: inline-block;
		margin-right: 1rem;
		margin-bottom: 0.8rem;
	}
	ol {
		padding-left: 1.5rem;
	}
	li {
		margin-bottom: 0.5rem;
	}
	li::first-letter {
		text-transform: uppercase;
	}
	li::marker {
		color: var(--fg-secondary);
	}
	.error {
		color: var(--fg-primary);
	}
	.error-message {
		font-size: var(--fs-small);
		color: var(--fg-secondary);
		font-style: italic;
	}
</style>
