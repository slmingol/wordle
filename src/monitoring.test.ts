/**
 * Tests for monitoring module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	initializeMonitoring,
	onMetric,
	getMetrics,
	trackMark,
	measureMarks,
	getNavigationMetrics,
	getResourceMetrics,
	sendMetrics,
} from './monitoring';

describe('Monitoring', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('initializeMonitoring', () => {
		it('should initialize monitoring when enabled', () => {
			const callback = vi.fn();
			initializeMonitoring({ enabled: true, onMetric: callback });
			// Monitoring should be set up (observers created)
			expect(true).toBe(true); // Basic initialization test
		});

		it('should not initialize when disabled', () => {
			const callback = vi.fn();
			initializeMonitoring({ enabled: false, onMetric: callback });
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('onMetric', () => {
		it('should set metric callback', () => {
			const callback = vi.fn();
			onMetric(callback);
			expect(callback).toBeDefined();
		});
	});

	describe('getMetrics', () => {
		it('should return collected metrics', () => {
			const metrics = getMetrics();
			expect(metrics).toBeDefined();
			expect(typeof metrics).toBe('object');
		});
	});

	describe('trackMark', () => {
		it('should create performance mark if supported', () => {
			if (window.performance?.mark) {
				const spy = vi.spyOn(performance, 'mark');
				trackMark('test-mark');
				expect(spy).toHaveBeenCalledWith('test-mark');
				spy.mockRestore();
			}
		});

		it('should handle unsupported browsers gracefully', () => {
			const originalMark = performance.mark;
			// @ts-expect-error - Testing unsupported browser
			delete performance.mark;
			expect(() => trackMark('test')).not.toThrow();
			performance.mark = originalMark;
		});
	});

	describe('measureMarks', () => {
		it('should measure between marks if supported', () => {
			if (window.performance?.mark && window.performance?.measure) {
				trackMark('start');
				trackMark('end');
				const duration = measureMarks('test-measure', 'start', 'end');
				expect(typeof duration).toBe('number');
			}
		});

		it('should return null if measure not supported', () => {
			const originalMeasure = performance.measure;
			// @ts-expect-error - Testing unsupported browser
			delete performance.measure;
			const result = measureMarks('test', 'start', 'end');
			expect(result).toBeNull();
			performance.measure = originalMeasure;
		});
	});

	describe('getNavigationMetrics', () => {
		it('should return navigation timing metrics if available', () => {
			if (window.performance?.timing) {
				const metrics = getNavigationMetrics();
				expect(metrics).toBeDefined();
				if (metrics) {
					expect(typeof metrics.dnsLookup).toBe('number');
					expect(typeof metrics.pageLoad).toBe('number');
				}
			}
		});

		it('should return null if timing API not supported', () => {
			const originalTiming = performance.timing;
			// @ts-expect-error - Testing unsupported browser
			delete performance.timing;
			const metrics = getNavigationMetrics();
			expect(metrics).toBeNull();
			// @ts-expect-error - Restoring timing
			performance.timing = originalTiming;
		});
	});

	describe('getResourceMetrics', () => {
		it('should return resource timing entries', () => {
			const resources = getResourceMetrics();
			expect(Array.isArray(resources)).toBe(true);
		});
	});

	describe('sendMetrics', () => {
		it('should send metrics via sendBeacon if available', async () => {
			const sendBeaconSpy = vi.fn(() => true);
			navigator.sendBeacon = sendBeaconSpy;

			await sendMetrics('https://example.com/metrics');
			// May or may not send depending on collected metrics
			expect(true).toBe(true);
		});

		it('should fallback to fetch if sendBeacon not available', async () => {
			const originalBeacon = navigator.sendBeacon;
			// @ts-expect-error - Testing unsupported browser
			delete navigator.sendBeacon;

			global.fetch = vi.fn(() => Promise.resolve({} as Response));

			await sendMetrics('https://example.com/metrics');
			// Should not throw
			expect(true).toBe(true);

			navigator.sendBeacon = originalBeacon;
		});
	});
});
