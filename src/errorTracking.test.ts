/**
 * Tests for error tracking module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	initializeErrorTracking,
	trackError,
	addBreadcrumb,
	setContext,
	setTag,
	setUserContext,
	getErrorTrackingConfig,
	Breadcrumbs,
} from './errorTracking';

describe('ErrorTracking', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('initializeErrorTracking', () => {
		it('should initialize with config', () => {
			initializeErrorTracking({
				enabled: true,
				provider: 'sentry',
				dsn: 'test-dsn',
			});

			const config = getErrorTrackingConfig();
			expect(config.enabled).toBe(true);
			expect(config.provider).toBe('sentry');
		});

		it('should not initialize when disabled', () => {
			initializeErrorTracking({ enabled: false });

			const config = getErrorTrackingConfig();
			expect(config.enabled).toBe(false);
		});
	});

	describe('trackError', () => {
		it('should track Error objects', () => {
			initializeErrorTracking({ enabled: true, provider: 'custom' });

			const error = new Error('Test error');
			expect(() => trackError(error)).not.toThrow();
		});

		it('should track string errors', () => {
			initializeErrorTracking({ enabled: true, provider: 'custom' });

			expect(() => trackError('String error')).not.toThrow();
		});

		it('should include context', () => {
			initializeErrorTracking({ enabled: true, provider: 'custom' });

			const context = { component: 'TestComponent', action: 'click' };
			expect(() => trackError('Error with context', context)).not.toThrow();
		});

		it('should respect sample rate', () => {
			initializeErrorTracking({
				enabled: true,
				provider: 'custom',
				sampleRate: 0, // Never send
			});

			const spy = vi.fn();
			global.fetch = spy;

			trackError('Test error');
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('addBreadcrumb', () => {
		it('should add breadcrumb', () => {
			expect(() =>
				addBreadcrumb({
					category: 'test',
					message: 'Test breadcrumb',
					level: 'info',
				})
			).not.toThrow();
		});

		it('should add breadcrumb with data', () => {
			expect(() =>
				addBreadcrumb({
					category: 'test',
					message: 'Test breadcrumb',
					level: 'info',
					data: { key: 'value' },
				})
			).not.toThrow();
		});
	});

	describe('setUserContext', () => {
		it('should set user context', () => {
			initializeErrorTracking({ enabled: true, provider: 'sentry' });

			expect(() =>
				setUserContext({
					id: '123',
					username: 'testuser',
				})
			).not.toThrow();
		});
	});

	describe('setContext', () => {
		it('should set custom context', () => {
			initializeErrorTracking({ enabled: true, provider: 'sentry' });

			expect(() =>
				setContext('game', {
					mode: 'daily',
					round: 123,
				})
			).not.toThrow();
		});
	});

	describe('setTag', () => {
		it('should set tag', () => {
			initializeErrorTracking({ enabled: true, provider: 'sentry' });

			expect(() => setTag('environment', 'test')).not.toThrow();
		});
	});

	describe('Breadcrumbs helpers', () => {
		it('should add navigation breadcrumb', () => {
			expect(() => Breadcrumbs.navigation('/daily')).not.toThrow();
		});

		it('should add user action breadcrumb', () => {
			expect(() => Breadcrumbs.userAction('Clicked button')).not.toThrow();
		});

		it('should add API call breadcrumb', () => {
			expect(() => Breadcrumbs.apiCall('/api/test', 'GET', 200)).not.toThrow();
		});

		it('should add state change breadcrumb', () => {
			expect(() => Breadcrumbs.stateChange('gameState', 'Won game')).not.toThrow();
		});
	});
});
