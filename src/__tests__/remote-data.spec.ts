import {
	pending,
	failure,
	success,
	RemoteData,
	initial,
	combine,
	remoteData,
	getEq,
	getOrd,
	getSemigroup,
	getMonoid,
	fromOption,
	fromEither,
	fromPredicate,
	progress,
	fromProgressEvent,
} from '../remote-data';
import { identity, flow, FunctionN } from 'fp-ts/lib/function';
import { none, option, some } from 'fp-ts/lib/Option';
import { array } from 'fp-ts/lib/Array';
import { eqNumber, eqString } from 'fp-ts/lib/Eq';
import { ordNumber, ordString } from 'fp-ts/lib/Ord';
import { semigroupString, semigroupSum } from 'fp-ts/lib/Semigroup';
import { monoidString, monoidSum } from 'fp-ts/lib/Monoid';
import { left, right } from 'fp-ts/lib/Either';
import * as RD from '../remote-data';
import { pipe } from 'fp-ts/lib/pipeable';

describe('RemoteData', () => {
	const double = (x: number) => x * 2;
	const initialRD: RemoteData<string, number> = initial;
	const pendingRD: RemoteData<string, number> = pending;
	const successRD: RemoteData<string, number> = success(1);
	const failureRD: RemoteData<string, number> = failure('foo');
	const progressRD: RemoteData<string, FunctionN<[number], number>> = progress({ loaded: 1, total: none });
	describe('Functor', () => {
		describe('should map over value', () => {
			it('initial', () => {
				expect(RD.remoteData.map(initial, double)).toBe(initial);
			});
			it('pending', () => {
				expect(RD.remoteData.map(pending, double)).toBe(pending);
			});
			it('failure', () => {
				const failed = failure<string, number>('foo');
				expect(RD.remoteData.map(failed, double)).toBe(failed);
			});
			it('success', () => {
				const value = 123;
				const succeeded = success(value);
				const result = RD.remoteData.map(succeeded, double);
				expect(result).toEqual(success(value * 2));
			});
		});
		describe('laws', () => {
			describe('identity', () => {
				it('initial', () => {
					expect(RD.remoteData.map(initial, identity)).toBe(initial);
				});
				it('pending', () => {
					expect(RD.remoteData.map(pending, identity)).toBe(pending);
				});
				it('failure', () => {
					const failed = failure('foo');
					expect(RD.remoteData.map(failed, identity)).toBe(failed);
				});
				it('success', () => {
					const succeeded = success('foo');
					const result = RD.remoteData.map(succeeded, identity);
					expect(result).toEqual(succeeded);
					expect(result).not.toBe(succeeded);
				});
			});
			describe('composition', () => {
				const double = (a: number): number => a * 2;
				const quad = flow(
					double,
					double,
				);
				it('initial', () => {
					expect(RD.remoteData.map(initial, quad)).toBe(
						pipe(
							initial,
							RD.map(double),
							RD.map(double),
						),
					);
				});
				it('pending', () => {
					expect(RD.remoteData.map(pending, quad)).toBe(
						pipe(
							pending,
							RD.map(double),
							RD.map(double),
						),
					);
				});
				it('failure', () => {
					const failed: RemoteData<string, number> = failure('foo');
					expect(RD.remoteData.map(failed, quad)).toBe(
						pipe(
							failed,
							RD.map(double),
							RD.map(double),
						),
					);
				});
				it('success', () => {
					const value = 1;
					const succeeded = success(value);
					expect(RD.remoteData.map(succeeded, quad)).toEqual(success(quad(value)));
				});
			});
		});
	});
	describe('Alt', () => {
		describe('should alt', () => {
			it('initial', () => {
				expect(RD.remoteData.alt(initialRD, () => initialRD)).toBe(initialRD);
				expect(RD.remoteData.alt(initialRD, () => pendingRD)).toBe(pendingRD);
				expect(RD.remoteData.alt(initialRD, () => failureRD)).toBe(failureRD);
				expect(RD.remoteData.alt(initialRD, () => successRD)).toBe(successRD);
			});
			it('pending', () => {
				expect(RD.remoteData.alt(pendingRD, () => initialRD)).toBe(initialRD);
				expect(RD.remoteData.alt(pendingRD, () => pendingRD)).toBe(pendingRD);
				expect(RD.remoteData.alt(pendingRD, () => failureRD)).toBe(failureRD);
				expect(RD.remoteData.alt(pendingRD, () => successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(RD.remoteData.alt(failureRD, () => pendingRD)).toBe(pendingRD);
				expect(RD.remoteData.alt(failureRD, () => initialRD)).toBe(initialRD);
				expect(RD.remoteData.alt(failureRD, () => failureRD)).toBe(failureRD);
				expect(RD.remoteData.alt(failureRD, () => successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(RD.remoteData.alt(successRD, () => pendingRD)).toBe(successRD);
				expect(RD.remoteData.alt(successRD, () => initialRD)).toBe(successRD);
				expect(RD.remoteData.alt(successRD, () => failureRD)).toBe(successRD);
				expect(RD.remoteData.alt(successRD, () => successRD)).toBe(successRD);
			});
		});
	});
	describe('Apply', () => {
		describe('should ap', () => {
			const f: RemoteData<string, (a: number) => number> = success(double);
			const failedF: RemoteData<string, (a: number) => number> = failure('foo');
			it('initial', () => {
				expect(RD.remoteData.ap(initial, initialRD)).toBe(initialRD);
				expect(RD.remoteData.ap(pending, initialRD)).toBe(initialRD);
				expect(RD.remoteData.ap(progressRD, initialRD)).toBe(initialRD);
				expect(RD.remoteData.ap(failedF, initialRD)).toBe(failedF);
				expect(RD.remoteData.ap(f, initialRD)).toBe(initialRD);
			});
			it('pending', () => {
				expect(RD.remoteData.ap(initial, pendingRD)).toBe(initial);
				expect(RD.remoteData.ap(pending, pendingRD)).toBe(pendingRD);
				expect(RD.remoteData.ap(progressRD, pendingRD)).toBe(progressRD);
				expect(RD.remoteData.ap(failedF, pendingRD)).toBe(failedF);
				expect(RD.remoteData.ap(f, pendingRD)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(RD.remoteData.ap(initial, failureRD)).toBe(failureRD);
				expect(RD.remoteData.ap(pending, failureRD)).toBe(failureRD);
				expect(RD.remoteData.ap(progressRD, failureRD)).toBe(failureRD);
				expect(RD.remoteData.ap(failedF, failureRD)).toBe(failedF);
				expect(RD.remoteData.ap(f, failureRD)).toBe(failureRD);
			});
			it('success', () => {
				expect(RD.remoteData.ap(initial, successRD)).toBe(initial);
				expect(RD.remoteData.ap(pending, successRD)).toBe(pending);
				expect(RD.remoteData.ap(progressRD, successRD)).toBe(progressRD);
				expect(RD.remoteData.ap(failedF, successRD)).toBe(failedF);
				expect(RD.remoteData.ap(f, successRD)).toEqual(success(double(1)));
			});
		});
	});
	describe('Applicative', () => {
		describe('sequence', () => {
			const s = array.sequence(remoteData);
			it('initial', () => {
				expect(s([initialRD, successRD])).toBe(initialRD);
			});
			it('pending', () => {
				expect(s([pendingRD, successRD])).toBe(pendingRD);
			});
			it('failure', () => {
				expect(s([failureRD, successRD])).toBe(failureRD);
			});
			it('success', () => {
				expect(s([success(123), success(456)])).toEqual(success([123, 456]));
			});
		});
	});
	describe('Chain', () => {
		describe('chain', () => {
			it('initial', () => {
				expect(RD.remoteData.chain(initialRD, () => initialRD)).toBe(initialRD);
				expect(RD.remoteData.chain(initialRD, () => pendingRD)).toBe(initialRD);
				expect(RD.remoteData.chain(initialRD, () => failureRD)).toBe(initialRD);
				expect(RD.remoteData.chain(initialRD, () => successRD)).toBe(initialRD);
			});
			it('pending', () => {
				expect(RD.remoteData.chain(pendingRD, () => initialRD)).toBe(pendingRD);
				expect(RD.remoteData.chain(pendingRD, () => pendingRD)).toBe(pendingRD);
				expect(RD.remoteData.chain(pendingRD, () => failureRD)).toBe(pendingRD);
				expect(RD.remoteData.chain(pendingRD, () => successRD)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(RD.remoteData.chain(failureRD, () => initialRD)).toBe(failureRD);
				expect(RD.remoteData.chain(failureRD, () => pendingRD)).toBe(failureRD);
				expect(RD.remoteData.chain(failureRD, () => failureRD)).toBe(failureRD);
				expect(RD.remoteData.chain(failureRD, () => successRD)).toBe(failureRD);
			});
			it('success', () => {
				expect(RD.remoteData.chain(successRD, () => initialRD)).toBe(initialRD);
				expect(RD.remoteData.chain(successRD, () => pendingRD)).toBe(pendingRD);
				expect(RD.remoteData.chain(successRD, () => failureRD)).toBe(failureRD);
				expect(RD.remoteData.chain(successRD, () => successRD)).toBe(successRD);
			});
		});
	});
	describe('Extend', () => {
		describe('extend', () => {
			const f = () => 1;
			it('initial', () => {
				expect(RD.remoteData.extend(initialRD, f)).toBe(initialRD);
			});
			it('pending', () => {
				expect(RD.remoteData.extend(pendingRD, f)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(RD.remoteData.extend(failureRD, f)).toBe(failureRD);
			});
			it('pending', () => {
				expect(RD.remoteData.extend(successRD, f)).toEqual(success(1));
			});
		});
	});
	describe('Traversable2v', () => {
		describe('traverse', () => {
			const t = remoteData.traverse(option);
			const f = (x: number) => (x >= 2 ? some(x) : none);
			it('initial', () => {
				expect(t(initialRD, f)).toEqual(some(initialRD));
			});
			it('pending', () => {
				expect(t(pendingRD, f)).toEqual(some(pendingRD));
			});
			it('failure', () => {
				expect(t(failureRD, f)).toEqual(some(failureRD));
			});
			it('success', () => {
				expect(t(success(1), f)).toBe(none);
				expect(t(success(3), f)).toEqual(some(success(3)));
			});
		});
	});
	describe('Foldable2v', () => {
		describe('reduce', () => {
			const f = (a: number, b: number) => a + b;
			const g = (a: number) => a + 1;
			it('initial', () => {
				expect(RD.remoteData.reduce(initialRD, 1, f)).toBe(1);
				expect(RD.remoteData.foldMap(monoidSum)(initialRD, g)).toBe(0);
				expect(RD.remoteData.reduceRight(initialRD, 1, f)).toBe(1);
			});
			it('pending', () => {
				expect(RD.remoteData.reduce(pendingRD, 1, f)).toBe(1);
				expect(RD.remoteData.foldMap(monoidSum)(pendingRD, g)).toBe(0);
				expect(RD.remoteData.reduceRight(pendingRD, 1, f)).toBe(1);
			});
			it('failure', () => {
				expect(RD.remoteData.reduce(failureRD, 1, f)).toBe(1);
				expect(RD.remoteData.foldMap(monoidSum)(failureRD, g)).toBe(0);
				expect(RD.remoteData.reduceRight(failureRD, 1, f)).toBe(1);
			});
			it('success', () => {
				expect(RD.remoteData.reduce(successRD, 1, f)).toBe(2);
				expect(RD.remoteData.foldMap(monoidSum)(successRD, g)).toBe(2);
				expect(RD.remoteData.reduceRight(successRD, 1, f)).toBe(2);
			});
		});
	});
	describe('Bifunctor', () => {
		describe('bimap', () => {
			const f = (l: string): string => `Error: ${l}`;
			const g = (a: number): number => a + 1;
			it('initial', () => {
				expect(RD.remoteData.bimap(initialRD, f, g)).toBe(initial);
				expect(RD.remoteData.bimap(initialRD, identity, identity)).toBe(initial);
			});
			it('pending', () => {
				expect(RD.remoteData.bimap(pendingRD, f, g)).toBe(pending);
				expect(RD.remoteData.bimap(pendingRD, identity, identity)).toBe(pending);
			});
			it('failure', () => {
				expect(RD.remoteData.bimap(failureRD, f, g)).toEqual(failureRD.mapLeft(f));
				expect(RD.remoteData.bimap(failureRD, f, g)).toEqual(failure('Error: foo'));
				expect(RD.remoteData.bimap(failureRD, identity, identity)).toEqual(failureRD);
			});
			it('success', () => {
				expect(RD.remoteData.bimap(successRD, f, g)).toEqual(successRD.map(g));
				expect(RD.remoteData.bimap(successRD, f, g)).toEqual(success(2));
				expect(RD.remoteData.bimap(successRD, identity, identity)).toEqual(successRD);
			});
		});
	});
	describe('Alternative', () => {
		it('zero', () => {
			expect(remoteData.zero()).toBe(initial);
		});
	});
	describe('Setoid', () => {
		describe('getSetoid', () => {
			const equals = getEq(eqString, eqNumber).equals;
			it('initial', () => {
				expect(equals(initialRD, initialRD)).toBe(true);
				expect(equals(initialRD, pendingRD)).toBe(false);
				expect(equals(initialRD, failureRD)).toBe(false);
				expect(equals(initialRD, successRD)).toBe(false);
			});
			it('pending', () => {
				expect(equals(pendingRD, initialRD)).toBe(false);
				expect(equals(pendingRD, pendingRD)).toBe(true);
				expect(equals(pendingRD, failureRD)).toBe(false);
				expect(equals(pendingRD, successRD)).toBe(false);
			});
			it('failure', () => {
				expect(equals(failureRD, initialRD)).toBe(false);
				expect(equals(failureRD, pendingRD)).toBe(false);
				expect(equals(failureRD, failureRD)).toBe(true);
				expect(equals(failure('1'), failure('2'))).toBe(false);
				expect(equals(failureRD, successRD)).toBe(false);
			});
			it('success', () => {
				expect(equals(successRD, initialRD)).toBe(false);
				expect(equals(successRD, pendingRD)).toBe(false);
				expect(equals(successRD, failureRD)).toBe(false);
				expect(equals(successRD, successRD)).toBe(true);
				expect(equals(success(1), success(2))).toBe(false);
			});
		});
	});
	describe('Ord', () => {
		describe('getOrd', () => {
			const compare = getOrd(ordString, ordNumber).compare;
			it('initial', () => {
				expect(compare(initialRD, initialRD)).toBe(0);
				expect(compare(initialRD, pendingRD)).toBe(-1);
				expect(compare(initialRD, failureRD)).toBe(-1);
				expect(compare(initialRD, successRD)).toBe(-1);
			});
			it('pending', () => {
				expect(compare(pendingRD, initialRD)).toBe(1);
				expect(compare(pendingRD, pendingRD)).toBe(0);
				expect(compare(pendingRD, failureRD)).toBe(-1);
				expect(compare(pendingRD, successRD)).toBe(-1);
			});
			it('failure', () => {
				expect(compare(failureRD, initialRD)).toBe(1);
				expect(compare(failureRD, pendingRD)).toBe(1);
				expect(compare(failureRD, failureRD)).toBe(0);
				expect(compare(failureRD, successRD)).toBe(-1);
				expect(compare(failure('1'), failure('2'))).toBe(-1);
				expect(compare(failure('2'), failure('1'))).toBe(1);
			});
			it('success', () => {
				expect(compare(successRD, initialRD)).toBe(1);
				expect(compare(successRD, pendingRD)).toBe(1);
				expect(compare(successRD, failureRD)).toBe(1);
				expect(compare(successRD, successRD)).toBe(0);
				expect(compare(success(1), success(2))).toBe(-1);
				expect(compare(success(2), success(1))).toBe(1);
			});
		});
	});
	describe('Semigroup', () => {
		describe('getSemigroup', () => {
			const concat = getSemigroup(semigroupString, semigroupSum).concat;
			it('initial', () => {
				expect(concat(initialRD, initialRD)).toBe(initialRD);
				expect(concat(initialRD, pendingRD)).toBe(pendingRD);
				expect(concat(initialRD, failureRD)).toBe(failureRD);
				expect(concat(initialRD, successRD)).toBe(successRD);
			});
			it('pending', () => {
				expect(concat(pendingRD, initialRD)).toBe(pendingRD);
				expect(concat(pendingRD, pendingRD)).toBe(pendingRD);
				expect(concat(pendingRD, failureRD)).toBe(failureRD);
				expect(concat(pendingRD, successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(concat(failureRD, initialRD)).toBe(failureRD);
				expect(concat(failureRD, pendingRD)).toBe(failureRD);
				expect(concat(failure('foo'), failure('bar'))).toEqual(failure(semigroupString.concat('foo', 'bar')));
				expect(concat(failureRD, successRD)).toBe(successRD);
			});
			it('success', () => {
				expect(concat(successRD, initialRD)).toBe(successRD);
				expect(concat(successRD, pendingRD)).toBe(successRD);
				expect(concat(successRD, failureRD)).toBe(successRD);
				expect(concat(success(1), success(1))).toEqual(success(semigroupSum.concat(1, 1)));
			});
			describe('progress', () => {
				it('should concat pendings without progress', () => {
					expect(concat(pending, pending)).toEqual(pending);
				});
				it('should concat pending and progress', () => {
					const withProgress: RemoteData<string, number> = progress({ loaded: 1, total: none });
					expect(concat(pending, withProgress)).toBe(withProgress);
				});
				it('should concat progress without total', () => {
					const withProgress: RemoteData<string, number> = progress({ loaded: 1, total: none });
					expect(concat(withProgress, withProgress)).toEqual(progress({ loaded: 2, total: none }));
				});
				it('should concat progress without total and progress with total', () => {
					const withProgress: RemoteData<string, number> = progress({ loaded: 1, total: none });
					const withProgressAndTotal: RemoteData<string, number> = progress({ loaded: 1, total: some(2) });
					expect(concat(withProgress, withProgressAndTotal)).toEqual(progress({ loaded: 2, total: none }));
				});
				it('should combine progresses with total', () => {
					const expected = progress({
						loaded: (2 * 10 + 2 * 30) / (40 * 40),
						total: some(10 + 30),
					});
					expect(
						concat(progress({ loaded: 2, total: some(10) }), progress({ loaded: 2, total: some(30) })),
					).toEqual(expected);
				});
			});
		});
	});
	describe('Monoid', () => {
		it('getMonoid', () => {
			const empty = getMonoid(monoidString, monoidSum).empty;
			expect(empty).toBe(initial);
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
			it('should combine arbitrary non-failure values to first initial', () => {
				expect(combine(success(123), success('foo'), pending, initial)).toBe(initial);
				expect(combine(initial, pending, success('foo'), success(123))).toBe(initial);
			});
			it('should combine arbitrary non-failure & non-initial values to first pending', () => {
				expect(combine(success(123), success('foo'), pending)).toBe(pending);
				expect(combine(pending, success('foo'), success(123))).toBe(pending);
			});
			it('should combine arbitrary values to first failure', () => {
				expect(combine(success(123), success('foo'), failure('bar'))).toEqual(failure('bar'));
				expect(combine(failure('bar'), success('foo'), success(123))).toEqual(failure('bar'));
			});
			describe('progress', () => {
				it('should combine pendings without progress', () => {
					expect(combine(pending, pending)).toBe(pending);
					expect(combine(pending, pending, pending)).toBe(pending);
					expect(combine(pending, pending, pending, pending)).toBe(pending);
				});
				it('should combine pending and progress', () => {
					const withProgress = progress({ loaded: 1, total: none });
					expect(combine(pending, withProgress)).toBe(withProgress);
					expect(combine(withProgress, pending)).toBe(withProgress);
				});
				it('should combine progress without total', () => {
					const withProgress = progress({ loaded: 1, total: none });
					expect(combine(withProgress, withProgress)).toEqual(progress({ loaded: 2, total: none }));
					expect(combine(withProgress, withProgress, withProgress)).toEqual(
						progress({ loaded: 3, total: none }),
					);
				});
				it('should combine progress without total and progress with total', () => {
					const withProgress = progress({ loaded: 1, total: none });
					const withProgressAndTotal = progress({ loaded: 1, total: some(2) });
					expect(combine(withProgress, withProgressAndTotal)).toEqual(progress({ loaded: 2, total: none }));
					expect(combine(withProgressAndTotal, withProgress)).toEqual(progress({ loaded: 2, total: none }));
				});
				it('should combine progresses with total', () => {
					const expected = progress({
						loaded: (2 * 10 + 2 * 30) / (40 * 40),
						total: some(10 + 30),
					});
					expect(
						combine(progress({ loaded: 2, total: some(10) }), progress({ loaded: 2, total: some(30) })),
					).toEqual(expected);
					expect(
						combine(progress({ loaded: 2, total: some(30) }), progress({ loaded: 2, total: some(10) })),
					).toEqual(expected);
				});
			});
		});
		describe('fromOption', () => {
			const error = new Error('foo');
			it('none', () => {
				expect(fromOption(none, () => error)).toEqual(failure(error));
			});
			it('some', () => {
				expect(fromOption(some(123), () => error)).toEqual(success(123));
			});
		});
		describe('fromEither', () => {
			it('left', () => {
				expect(fromEither(left('123'))).toEqual(failure('123'));
			});
			it('right', () => {
				expect(fromEither(right('123'))).toEqual(success('123'));
			});
		});
		describe('fromPredicate', () => {
			const factory = fromPredicate((value: boolean) => value, () => '123');
			it('false', () => {
				expect(factory(false)).toEqual(failure('123'));
			});
			it('true', () => {
				expect(factory(true)).toEqual(success(true));
			});
		});
		describe('fromProgressEvent', () => {
			const e = new ProgressEvent('test');
			it('lengthComputable === false', () => {
				expect(fromProgressEvent({ ...e, loaded: 123 })).toEqual(progress({ loaded: 123, total: none }));
			});
			it('lengthComputable === true', () => {
				expect(fromProgressEvent({ ...e, loaded: 123, lengthComputable: true, total: 1000 })).toEqual(
					progress({ loaded: 123, total: some(1000) }),
				);
			});
		});
		describe('getOrElse', () => {
			it('initial', () => {
				expect(RD.getOrElse(() => 0)(initialRD)).toBe(0);
			});
			it('pending', () => {
				expect(RD.getOrElse(() => 0)(pendingRD)).toBe(0);
			});
			it('failure', () => {
				expect(RD.getOrElse(() => 0)(failureRD)).toBe(0);
			});
			it('success', () => {
				expect(RD.getOrElse(() => 0)(success(1))).toBe(1);
			});
		});
		describe('fold', () => {
			it('initial', () => {
				expect(RD.fold(() => 1, () => 2, () => 3, () => 4)(initialRD)).toBe(1);
			});
			it('pending', () => {
				expect(RD.fold(() => 1, () => 2, () => 3, () => 4)(pendingRD)).toBe(2);
			});
			it('failure', () => {
				expect(RD.fold(() => 1, () => 2, () => 3, () => 4)(failureRD)).toBe(3);
			});
			it('success', () => {
				expect(RD.fold(() => 1, () => 2, () => 3, () => 4)(successRD)).toBe(4);
			});
		});
	});
	describe('instance methods', () => {
		describe('getOrElse', () => {
			it('initial', () => {
				expect(initialRD.getOrElse(0)).toBe(0);
			});
			it('pending', () => {
				expect(pendingRD.getOrElse(0)).toBe(0);
			});
			it('failure', () => {
				expect(failureRD.getOrElse(0)).toBe(0);
			});
			it('success', () => {
				expect(success(1).getOrElse(0)).toBe(1);
			});
		});
		describe('getOrElseL', () => {
			it('initial', () => {
				expect(initialRD.getOrElseL(() => 0)).toBe(0);
			});
			it('pending', () => {
				expect(pendingRD.getOrElseL(() => 0)).toBe(0);
			});
			it('failure', () => {
				expect(failureRD.getOrElseL(() => 0)).toBe(0);
			});
			it('success', () => {
				expect(success(1).getOrElseL(() => 0)).toBe(1);
			});
		});
		describe('fold', () => {
			it('initial', () => {
				expect(initialRD.fold(1, 2, () => 3, () => 4)).toBe(1);
			});
			it('pending', () => {
				expect(pendingRD.fold(1, 2, () => 3, () => 4)).toBe(2);
			});
			it('failure', () => {
				expect(failureRD.fold(1, 2, () => 3, () => 4)).toBe(3);
			});
			it('success', () => {
				expect(successRD.fold(1, 2, () => 3, () => 4)).toBe(4);
			});
		});
		describe('foldL', () => {
			it('initial', () => {
				expect(initialRD.foldL(() => 1, () => 2, () => 3, () => 4)).toBe(1);
			});
			it('pending', () => {
				expect(pendingRD.foldL(() => 1, () => 2, () => 3, () => 4)).toBe(2);
			});
			it('failure', () => {
				expect(failureRD.foldL(() => 1, () => 2, () => 3, () => 4)).toBe(3);
			});
			it('success', () => {
				expect(successRD.foldL(() => 1, () => 2, () => 3, () => 4)).toBe(4);
			});
		});
		describe('altL', () => {
			it('initial', () => {
				expect(initialRD.altL(() => initialRD)).toBe(initialRD);
				expect(initialRD.altL(() => pendingRD)).toBe(pendingRD);
				expect(initialRD.altL(() => failureRD)).toBe(failureRD);
				expect(initialRD.altL(() => successRD)).toBe(successRD);
			});
			it('pending', () => {
				expect(pendingRD.altL(() => initialRD)).toBe(initialRD);
				expect(pendingRD.altL(() => pendingRD)).toBe(pendingRD);
				expect(pendingRD.altL(() => failureRD)).toBe(failureRD);
				expect(pendingRD.altL(() => successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(failureRD.altL(() => pendingRD)).toBe(pendingRD);
				expect(failureRD.altL(() => initialRD)).toBe(initialRD);
				expect(failureRD.altL(() => failureRD)).toBe(failureRD);
				expect(failureRD.altL(() => successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(successRD.altL(() => pendingRD)).toBe(successRD);
				expect(successRD.altL(() => initialRD)).toBe(successRD);
				expect(successRD.altL(() => failureRD)).toBe(successRD);
				expect(successRD.altL(() => successRD)).toBe(successRD);
			});
		});
		describe('mapLeft', () => {
			const f2 = () => 1;
			it('initial', () => {
				expect(initialRD.mapLeft(f2)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.mapLeft(f2)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failureRD.mapLeft(f2)).toEqual(failure(1));
			});
			it('success', () => {
				expect(successRD.mapLeft(f2)).toBe(successRD);
			});
		});
		describe('isInitial', () => {
			it('initial', () => {
				expect(initialRD.isInitial()).toBe(true);
			});
			it('pending', () => {
				expect(pendingRD.isInitial()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isInitial()).toEqual(false);
			});
			it('success', () => {
				expect(successRD.isInitial()).toBe(false);
			});
		});
		describe('isPending', () => {
			it('initial', () => {
				expect(initialRD.isPending()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isPending()).toBe(true);
			});
			it('failure', () => {
				expect(failureRD.isPending()).toEqual(false);
			});
			it('success', () => {
				expect(successRD.isPending()).toBe(false);
			});
		});
		describe('isFailure', () => {
			it('initial', () => {
				expect(initialRD.isFailure()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isFailure()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isFailure()).toEqual(true);
				if (failureRD.isFailure()) {
					expect(failureRD.error).toBeDefined();
				}
			});
			it('success', () => {
				expect(successRD.isFailure()).toBe(false);
			});
		});
		describe('isSuccess', () => {
			it('initial', () => {
				expect(initialRD.isSuccess()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isSuccess()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isSuccess()).toEqual(false);
			});
			it('success', () => {
				expect(successRD.isSuccess()).toBe(true);
				if (successRD.isSuccess()) {
					expect(successRD.value).toBeDefined();
				}
			});
		});
		describe('toOption', () => {
			it('initial', () => {
				expect(initialRD.toOption()).toBe(none);
			});
			it('pending', () => {
				expect(pendingRD.toOption()).toBe(none);
			});
			it('failure', () => {
				expect(failureRD.toOption()).toBe(none);
			});
			it('success', () => {
				expect(success(1).toOption()).toEqual(some(1));
			});
		});
		describe('toEither', () => {
			it('initial', () => {
				expect(initialRD.toEither('initial', 'pending')).toEqual(left('initial'));
			});
			it('pending', () => {
				expect(pendingRD.toEither('initial', 'pending')).toEqual(left('pending'));
			});
			it('failure', () => {
				expect(failureRD.toEither('initial', 'pending')).toEqual(left('foo'));
			});
			it('success', () => {
				expect(success(1).toEither('initial', 'pending')).toEqual(right(1));
			});
		});
		describe('toEitherL', () => {
			const initialL = () => 'initial';
			const pendingL = () => 'pending';

			it('initial', () => {
				expect(initialRD.toEitherL(initialL, pendingL)).toEqual(left('initial'));
			});
			it('pending', () => {
				expect(pendingRD.toEitherL(initialL, pendingL)).toEqual(left('pending'));
			});
			it('failure', () => {
				expect(failureRD.toEitherL(initialL, pendingL)).toEqual(left('foo'));
			});
			it('success', () => {
				expect(success(1).toEitherL(initialL, pendingL)).toEqual(right(1));
			});
		});
		describe('toNullable', () => {
			it('initial', () => {
				expect(initialRD.toNullable()).toBe(null);
			});
			it('pending', () => {
				expect(pendingRD.toNullable()).toBe(null);
			});
			it('failure', () => {
				expect(failureRD.toNullable()).toBe(null);
			});
			it('success', () => {
				expect(success(1).toNullable()).toEqual(1);
			});
		});
		describe('toString', () => {
			it('initial', () => {
				expect(initialRD.toString()).toBe('initial');
			});
			it('pending', () => {
				expect(pendingRD.toString()).toBe('pending');
			});
			it('failure', () => {
				expect(failure('foo').toString()).toBe('failure(foo)');
			});
			it('success', () => {
				expect(success(1).toString()).toBe('success(1)');
			});
		});
		describe('contains', () => {
			it('initial', () => {
				expect(initialRD.contains(eqNumber, 1)).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.contains(eqNumber, 1)).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.contains(eqNumber, 1)).toBe(false);
			});
			it('success', () => {
				expect(success(2).contains(eqNumber, 1)).toBe(false);
				expect(success(1).contains(eqNumber, 1)).toBe(true);
			});
		});
		describe('exists', () => {
			const p = (n: number) => n === 1;
			it('initial', () => {
				expect(initialRD.exists(p)).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.exists(p)).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.exists(p)).toBe(false);
			});
			it('success', () => {
				expect(success(2).exists(p)).toBe(false);
				expect(success(1).exists(p)).toBe(true);
			});
		});
		describe('recover', () => {
			const f = (error: string) => (error === 'foo' ? some(1) : none);
			it('initial', () => {
				expect(initialRD.recover(f)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.recover(f)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failure<string, number>('foo').recover(f)).toEqual(success(1));
			});
			it('success', () => {
				expect(successRD.recover(f)).toBe(successRD);
			});
		});
		describe('recoverMap', () => {
			const f = (error: string) => (error === 'foo' ? some(true) : none);
			const isOdd = (n: number) => n % 2 === 0;
			it('initial', () => {
				expect(initialRD.recoverMap(f, isOdd)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.recoverMap(f, isOdd)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failure<string, number>('foo').recoverMap(f, isOdd)).toEqual(success(true));
			});
			it('success', () => {
				expect(successRD.recoverMap(f, isOdd)).toEqual(success(false));
			});
		});
	});
});
