import { pending, failure, success, RemoteData, initial } from './../remote-data';
import { identity, compose } from 'fp-ts/lib/function';

describe('RemoteData', () => {
	const double = (x: number) => x * 2;
	describe('Functor', () => {
		describe('should map over value', () => {
			it('initial', () => {
				expect(initial.map(double)).toBe(initial);
			});
			it('pending', () => {
				expect(pending.map(double)).toBe(pending);
			});
			it('failure', () => {
				const failed = failure<string, number>('foo');
				expect(failed.map(double)).toBe(failed);
			});
			it('success', () => {
				const value = 123;
				const succeeded = success(value);
				const result = succeeded.map(double);
				expect(result).toEqual(success(value * 2));
			});
		});
		describe('laws', () => {
			describe('identity', () => {
				it('initial', () => {
					expect(initial.map(identity)).toBe(initial);
				});
				it('pending', () => {
					expect(pending.map(identity)).toBe(pending);
				});
				it('failure', () => {
					const failed = failure('foo');
					expect(failed.map(identity)).toBe(failed);
				});
				it('success', () => {
					const succeeded = success('foo');
					const result = succeeded.map(identity);
					expect(result).toEqual(succeeded);
					expect(result).not.toBe(succeeded);
				});
			});
			describe('composition', () => {
				const double = (a: number): number => a * 2;
				const quad = compose(double, double);
				it('initial', () => {
					expect(initial.map(quad)).toBe(initial.map(double).map(double));
				});
				it('pending', () => {
					expect(pending.map(quad)).toBe(pending.map(double).map(double));
				});
				it('failure', () => {
					const failed: RemoteData<string, number> = failure('foo');
					expect(failed.map(quad)).toBe(failed.map(double).map(double));
				});
				it('success', () => {
					const value = 1;
					const succeeded = success(value);
					expect(succeeded.map(quad)).toEqual(success(quad(value)));
				});
			});
		});
	});
	describe('Alt', () => {
		const initialRD: RemoteData<string, number> = initial;
		const pendingRD: RemoteData<string, number> = pending;
		const succeededRD: RemoteData<string, number> = success(1);
		const failedRD: RemoteData<string, number> = failure('foo');
		describe('should alt', () => {
			it('initial', () => {
				expect(initialRD.alt(initialRD)).toBe(initialRD);
				expect(initialRD.alt(pendingRD)).toBe(pendingRD);
				expect(initialRD.alt(failedRD)).toBe(failedRD);
				expect(initialRD.alt(succeededRD)).toBe(succeededRD);
			});
			it('pending', () => {
				expect(pendingRD.alt(initialRD)).toBe(initialRD);
				expect(pendingRD.alt(pendingRD)).toBe(pendingRD);
				expect(pendingRD.alt(failedRD)).toBe(failedRD);
				expect(pendingRD.alt(succeededRD)).toBe(succeededRD);
			});
			it('failure', () => {
				expect(failedRD.alt(pendingRD)).toBe(pendingRD);
				expect(failedRD.alt(initialRD)).toBe(initialRD);
				expect(failedRD.alt(failedRD)).toBe(failedRD);
				expect(failedRD.alt(succeededRD)).toBe(succeededRD);
			});
			it('failure', () => {
				expect(succeededRD.alt(pendingRD)).toBe(succeededRD);
				expect(succeededRD.alt(initialRD)).toBe(succeededRD);
				expect(succeededRD.alt(failedRD)).toBe(succeededRD);
				expect(succeededRD.alt(succeededRD)).toBe(succeededRD);
			});
		});
	});
});
