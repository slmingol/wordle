<script lang="ts">
	import { onMount } from "svelte";
	import { safeGetJSON, safeSetJSON, safeRemoveItem } from "../../localStorage";

	let visible = false;
	let analyticsConsent = false;

	const CONSENT_KEY = "analytics-consent";
	const CONSENT_VERSION = "1.0";

	interface ConsentData {
		accepted: boolean;
		version: string;
		timestamp: number;
	}

	onMount(() => {
		const consent = safeGetJSON<ConsentData | null>(CONSENT_KEY, null);
		if (!consent) {
			visible = true;
		} else if (consent.version === CONSENT_VERSION) {
			analyticsConsent = consent.accepted;
			if (analyticsConsent) {
				loadAnalytics();
			}
		} else {
			// Version mismatch, ask for consent again
			visible = true;
		}
	});

	function accept() {
		analyticsConsent = true;
		saveConsent(true);
		loadAnalytics();
		visible = false;
	}

	function decline() {
		analyticsConsent = false;
		saveConsent(false);
		visible = false;
	}

	function saveConsent(accepted: boolean) {
		safeSetJSON(CONSENT_KEY, {
			accepted,
			version: CONSENT_VERSION,
			timestamp: Date.now(),
		});
	}

	function loadAnalytics() {
		if (document.location.origin === "https://mikhad.github.io") {
			// Initialize Google Analytics
			window.dataLayer = window.dataLayer || [];
			function gtag(..._args: IArguments[]) {
				window.dataLayer.push(arguments);
			}
			(window as Window & { gtag: typeof gtag }).gtag = gtag;
			gtag("js", new Date());
			gtag("config", "G-RHN319RJ6V", {
				anonymize_ip: true,
				cookie_flags: "SameSite=None;Secure",
			});

			// Load GA script
			const script = document.createElement("script");
			script.async = true;
			script.src = "https://www.googletagmanager.com/gtag/js?id=G-RHN319RJ6V";
			document.head.appendChild(script);
		}
	}

	export function revokeConsent() {
		analyticsConsent = false;
		saveConsent(false);
		safeRemoveItem(CONSENT_KEY);
		// Reload page to clear analytics
		window.location.reload();
	}
</script>

{#if visible}
	<div class="consent-overlay" role="dialog" aria-modal="true" aria-label="Cookie consent">
		<div class="consent-banner">
			<div class="consent-content">
				<h3>Privacy & Cookies</h3>
				<p>
					We use Google Analytics to understand how visitors use this site. This helps us improve
					the game. Your IP address will be anonymized.
				</p>
				<p class="consent-details">
					You can change your preference at any time in the settings menu.
					<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
						Google Privacy Policy
					</a>
				</p>
			</div>
			<div class="consent-actions">
				<button class="consent-decline" on:click={decline}> Decline </button>
				<button class="consent-accept" on:click={accept}> Accept </button>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.consent-overlay {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		padding: 1rem;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.consent-banner {
		max-width: 800px;
		margin: 0 auto;
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.consent-content {
		margin-bottom: 1.5rem;

		h3 {
			margin: 0 0 0.75rem 0;
			font-size: var(--fs-medium);
			color: var(--fg-primary);
		}

		p {
			margin: 0.5rem 0;
			font-size: var(--fs-small);
			color: var(--fg-secondary);
			line-height: 1.5;
		}

		.consent-details {
			font-size: var(--fs-tiny);

			a {
				color: var(--color-present);
				text-decoration: underline;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}

	.consent-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;

		button {
			padding: 0.75rem 1.5rem;
			border-radius: 4px;
			font-size: var(--fs-small);
			font-weight: bold;
			cursor: pointer;
			transition: opacity 0.2s;
			border: none;

			&:hover {
				opacity: 0.9;
			}
		}

		.consent-decline {
			background: var(--bg-secondary);
			color: var(--fg-primary);
		}

		.consent-accept {
			background: var(--color-correct);
			color: white;
		}
	}

	@media (max-width: 600px) {
		.consent-banner {
			padding: 1rem;
		}

		.consent-actions {
			flex-direction: column;

			button {
				width: 100%;
			}
		}
	}
</style>
