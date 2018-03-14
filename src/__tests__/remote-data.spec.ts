import { pending, failure, success, RemoteData, initial, combine } from '../remote-data';
import { identity, compose } from 'fp-ts/lib/function';

describe('RemoteData', () => {
	const double = (x: number) => x * 2;
	const initialRD: RemoteData<string, number> = initial;
	const pendingRD: RemoteData<string, number> = pending;
	const succeededRD: RemoteData<string, number> = success(1);
	const failedRD: RemoteData<string, number> = failure('foo');
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
	describe('Apply', () => {
		describe('should ap', () => {
			const f: RemoteData<string, (a: number) => number> = success(double);
			const failedF: RemoteData<string, (a: number) => number> = failure('foo');
			it('initial', () => {
				expect(initialRD.ap(initial)).toBe(initialRD);
				expect(initialRD.ap(pending)).toBe(initialRD);
				expect(initialRD.ap(failedF)).toBe(initialRD);
				expect(initialRD.ap(f)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.ap(initial)).toBe(initial);
				expect(pendingRD.ap(pending)).toBe(pendingRD);
				expect(pendingRD.ap(failedF)).toBe(pendingRD);
				expect(pendingRD.ap(f)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failedRD.ap(initial)).toBe(initial);
				expect(failedRD.ap(pending)).toBe(pending);
				expect(failedRD.ap(failedF)).toBe(failedF);
				expect(failedRD.ap(f)).toBe(failedRD);
			});
			it('success', () => {
				expect(succeededRD.ap(initial)).toBe(initial);
				expect(succeededRD.ap(pending)).toBe(pending);
				expect(succeededRD.ap(failedF)).toBe(failedF);
				expect(succeededRD.ap(f)).toEqual(success(double(1)));
			});
		});
	});
	describe('Chain', () => {
		describe('chain', () => {
			it('initial', () => {
				expect(initialRD.chain(() => initialRD)).toBe(initialRD);
				expect(initialRD.chain(() => pendingRD)).toBe(initialRD);
				expect(initialRD.chain(() => failedRD)).toBe(initialRD);
				expect(initialRD.chain(() => succeededRD)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.chain(() => initialRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => pendingRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => failedRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => succeededRD)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failedRD.chain(() => initialRD)).toBe(failedRD);
				expect(failedRD.chain(() => pendingRD)).toBe(failedRD);
				expect(failedRD.chain(() => failedRD)).toBe(failedRD);
				expect(failedRD.chain(() => succeededRD)).toBe(failedRD);
			});
			it('success', () => {
				expect(succeededRD.chain(() => initialRD)).toBe(initialRD);
				expect(succeededRD.chain(() => pendingRD)).toBe(pendingRD);
				expect(succeededRD.chain(() => failedRD)).toBe(failedRD);
				expect(succeededRD.chain(() => succeededRD)).toBe(succeededRD);
			});
		});
	});
	describe('Extend', () => {
		describe('extend', () => {
			const f = () => 1;
			it('initial', () => {
				expect(initialRD.extend(f)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.extend(f)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failedRD.extend(f)).toBe(failedRD);
			});
			it('pending', () => {
				expect(succeededRD.extend(f)).toEqual(success(1));
			});
		});
	});
	describe('helpers', () => {
		describe('combine', () => {
			it('should combine all initials to initial', () => {
				expect(combine(initial, initial)).toBe(initial);
			});
			it('should combine all pendings to pending', () => {
				expect(combine(pending, pending)).toBe(pending);
			});
			it('should combine all failures to first failure', () => {
				expect(combine(failure('foo'), failure('bar'))).toEqual(failure('foo'));
			});
			it('should combine all successes to success of list of values', () => {
				expect(combine(success('foo'), success('bar'))).toEqual(success(['foo', 'bar']));
			});
			it('should combine arbitrary values to first initial', () => {
				const values = [success(123), success('foo'), failure('bar'), pending, initial];
				expect(combine.apply(null, values)).toBe(initial);
				expect(combine.apply(null, values.reverse())).toBe(initial);
			});
			it('should combine arbitrary values to first pending', () => {
				const values = [success(123), success('foo'), failure('bar'), pending];
				expect(combine.apply(null, values)).toBe(pending);
				expect(combine.apply(null, values.reverse())).toBe(pending);
			});
			it('should combine arbitrary values to first failure', () => {
				const values = [success(123), success('foo'), failure('bar')];
				expect(combine.apply(null, values)).toEqual(failure('bar'));
				expect(combine.apply(null, values.reverse())).toEqual(failure('bar'));
			});
		});
	});
});
