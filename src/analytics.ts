/**
 * Privacy-friendly analytics module
 * Supports multiple analytics providers with GDPR compliance
 */

import { safeGetItem, safeSetItem } from './localStorage';

export interface AnalyticsConfig {
	enabled: boolean;
	provider: 'plausible' | 'fathom' | 'google' | 'none';
	siteId?: string; // For Plausible/Fathom
	trackingId?: string; // For Google Analytics
	respectDNT?: boolean; // Respect Do Not Track
	anonymizeIP?: boolean; // Anonymize IP addresses
}

export interface AnalyticsEvent {
	name: string;
	properties?: Record<string, string | number | boolean>;
}

const CONSENT_KEY = 'analytics-consent';
const CONFIG_KEY = 'analytics-config';

let config: AnalyticsConfig = {
	enabled: false,
	provider: 'none',
	respectDNT: true,
	anonymizeIP: true,
};

let consentGiven = false;

/**
 * Check if user has Do Not Track enabled
 */
function isDNTEnabled(): boolean {
	return (
		navigator.doNotTrack === '1' ||
		(window as any).doNotTrack === '1' ||
		(navigator as any).msDoNotTrack === '1'
	);
}

/**
 * Initialize analytics
 */
export function initializeAnalytics(userConfig: Partial<AnalyticsConfig> = {}): void {
	// Load stored config
	const storedConfig = safeGetItem(CONFIG_KEY);
	if (storedConfig) {
		try {
			config = { ...config, ...JSON.parse(storedConfig) };
		} catch {
			// Invalid config, use defaults
		}
	}

	// Merge with user config
	config = { ...config, ...userConfig };

	// Check consent
	const consent = safeGetItem(CONSENT_KEY);
	consentGiven = consent === 'true';

	// Respect DNT
	if (config.respectDNT && isDNTEnabled()) {
		config.enabled = false;
		if (import.meta.env.DEV) {
			console.log('[Analytics] Disabled due to Do Not Track');
		}
		return;
	}

	// Only initialize if consent given and enabled
	if (!config.enabled || !consentGiven) {
		if (import.meta.env.DEV) {
			console.log('[Analytics] Not initialized - consent:', consentGiven, 'enabled:', config.enabled);
		}
		return;
	}

	// Initialize provider
	switch (config.provider) {
		case 'plausible':
			initializePlausible();
			break;
		case 'fathom':
			initializeFathom();
			break;
		case 'google':
			initializeGoogleAnalytics();
			break;
	}

	if (import.meta.env.DEV) {
		console.log('[Analytics] Initialized with provider:', config.provider);
	}
}

/**
 * Initialize Plausible Analytics
 */
function initializePlausible(): void {
	if (!config.siteId) {
		console.warn('[Analytics] Plausible site ID not configured');
		return;
	}

	// Load Plausible script
	const script = document.createElement('script');
	script.defer = true;
	script.dataset.domain = config.siteId;
	script.src = 'https://plausible.io/js/script.js';
	document.head.appendChild(script);
}

/**
 * Initialize Fathom Analytics
 */
function initializeFathom(): void {
	if (!config.trackingId) {
		console.warn('[Analytics] Fathom tracking ID not configured');
		return;
	}

	// Load Fathom script
	const script = document.createElement('script');
	script.src = 'https://cdn.usefathom.com/script.js';
	script.dataset.site = config.trackingId;
	script.dataset.spa = 'auto';
	script.defer = true;
	document.head.appendChild(script);
}

/**
 * Initialize Google Analytics
 */
function initializeGoogleAnalytics(): void {
	if (!config.trackingId) {
		console.warn('[Analytics] Google Analytics tracking ID not configured');
		return;
	}

	// Load gtag.js
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`;
	document.head.appendChild(script);

	// Initialize gtag
	(window as any).dataLayer = (window as any).dataLayer || [];
	function gtag(...args: any[]) {
		(window as any).dataLayer.push(arguments);
	}
	(window as any).gtag = gtag;

	gtag('js', new Date());
	gtag('config', config.trackingId, {
		anonymize_ip: config.anonymizeIP,
		cookie_flags: 'SameSite=None;Secure',
	});
}

/**
 * Track a page view
 */
export function trackPageView(url?: string): void {
	if (!config.enabled || !consentGiven) return;

	const pageUrl = url || window.location.pathname;

	switch (config.provider) {
		case 'plausible':
			if ((window as any).plausible) {
				(window as any).plausible('pageview', { url: pageUrl });
			}
			break;
		case 'fathom':
			if ((window as any).fathom) {
				(window as any).fathom.trackPageview({ url: pageUrl });
			}
			break;
		case 'google':
			if ((window as any).gtag) {
				(window as any).gtag('config', config.trackingId, {
					page_path: pageUrl,
				});
			}
			break;
	}

	if (import.meta.env.DEV) {
		console.log('[Analytics] Page view:', pageUrl);
	}
}

/**
 * Track a custom event
 */
export function trackEvent(event: AnalyticsEvent): void {
	if (!config.enabled || !consentGiven) return;

	const { name, properties = {} } = event;

	switch (config.provider) {
		case 'plausible':
			if ((window as any).plausible) {
				(window as any).plausible(name, { props: properties });
			}
			break;
		case 'fathom':
			if ((window as any).fathom) {
				(window as any).fathom.trackGoal(name, 0);
			}
			break;
		case 'google':
			if ((window as any).gtag) {
				(window as any).gtag('event', name, properties);
			}
			break;
	}

	if (import.meta.env.DEV) {
		console.log('[Analytics] Event:', name, properties);
	}
}

/**
 * Grant analytics consent
 */
export function grantConsent(): void {
	consentGiven = true;
	safeSetItem(CONSENT_KEY, 'true');
	initializeAnalytics();
}

/**
 * Revoke analytics consent
 */
export function revokeConsent(): void {
	consentGiven = false;
	safeSetItem(CONSENT_KEY, 'false');
	config.enabled = false;

	// Remove tracking scripts
	const scripts = document.querySelectorAll('script[src*="plausible"], script[src*="fathom"], script[src*="googletagmanager"]');
	scripts.forEach(script => script.remove());

	if (import.meta.env.DEV) {
		console.log('[Analytics] Consent revoked');
	}
}

/**
 * Check if consent has been given
 */
export function hasConsent(): boolean {
	return consentGiven;
}

/**
 * Update analytics configuration
 */
export function updateConfig(newConfig: Partial<AnalyticsConfig>): void {
	config = { ...config, ...newConfig };
	safeSetItem(CONFIG_KEY, JSON.stringify(config));

	if (consentGiven && config.enabled) {
		initializeAnalytics();
	}
}

/**
 * Get current analytics configuration
 */
export function getConfig(): Readonly<AnalyticsConfig> {
	return { ...config };
}

/**
 * Common game events to track
 */
export const GameEvents = {
	GAME_STARTED: (mode: string) => trackEvent({ 
		name: 'game_started', 
		properties: { mode } 
	}),
	GAME_WON: (mode: string, guesses: number) => trackEvent({ 
		name: 'game_won', 
		properties: { mode, guesses } 
	}),
	GAME_LOST: (mode: string) => trackEvent({ 
		name: 'game_lost', 
		properties: { mode } 
	}),
	GAME_SHARED: (mode: string) => trackEvent({ 
		name: 'game_shared', 
		properties: { mode } 
	}),
	SETTINGS_CHANGED: (setting: string, value: string | boolean) => trackEvent({ 
		name: 'settings_changed', 
		properties: { setting, value: String(value) } 
	}),
	THEME_CHANGED: (theme: string) => trackEvent({ 
		name: 'theme_changed', 
		properties: { theme } 
	}),
	MODE_SWITCHED: (from: string, to: string) => trackEvent({ 
		name: 'mode_switched', 
		properties: { from, to } 
	}),
};
