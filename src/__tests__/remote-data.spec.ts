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
	mapLeft,
	isInitial,
	isPending,
	isFailure,
	isSuccess,
	toOption,
	toEither,
	toNullable,
	getShow,
	elem,
	exists,
	recoverMap,
	recover,
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
import { showNumber, showString } from 'fp-ts/lib/Show';

describe('RemoteData', () => {
	const double = (x: number) => x * 2;
	const initialRD: RemoteData<string, number> = initial;
	const pendingRD: RemoteData<string, number> = pending;
	const successRD: RemoteData<string, number> = success(1);
	const failureRD: RemoteData<string, number> = failure('foo');
	const progressRD: RemoteData<string, FunctionN<[number], number>> = progress({ loaded: 1, total: none });
	describe('typeclasses', () => {
		describe('Functor', () => {
			describe('should map over value', () => {
				it('initial', () => {
					expect(remoteData.map(initial, double)).toBe(initial);
				});
				it('pending', () => {
					expect(remoteData.map(pending, double)).toBe(pending);
				});
				it('failure', () => {
					const failed = failure('foo');
					expect(remoteData.map(failed, double)).toBe(failed);
				});
				it('success', () => {
					const value = 123;
					const succeeded = success(value);
					const result = remoteData.map(succeeded, double);
					expect(result).toEqual(success(value * 2));
				});
			});
			describe('laws', () => {
				describe('identity', () => {
					it('initial', () => {
						expect(remoteData.map(initial, identity)).toBe(initial);
					});
					it('pending', () => {
						expect(remoteData.map(pending, identity)).toBe(pending);
					});
					it('failure', () => {
						const failed = failure('foo');
						expect(remoteData.map(failed, identity)).toBe(failed);
					});
					it('success', () => {
						const succeeded = success('foo');
						const result = remoteData.map(succeeded, identity);
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
						expect(remoteData.map(initial, quad)).toBe(
							pipe(
								initial,
								RD.map(double),
								RD.map(double),
							),
						);
					});
					it('pending', () => {
						expect(remoteData.map(pending, quad)).toBe(
							pipe(
								pending,
								RD.map(double),
								RD.map(double),
							),
						);
					});
					it('failure', () => {
						const failed: RemoteData<string, number> = failure('foo');
						expect(remoteData.map(failed, quad)).toBe(
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
						expect(remoteData.map(succeeded, quad)).toEqual(success(quad(value)));
					});
				});
			});
		});
		describe('Alt', () => {
			describe('should alt', () => {
				it('initial', () => {
					expect(remoteData.alt(initialRD, () => initialRD)).toBe(initialRD);
					expect(remoteData.alt(initialRD, () => pendingRD)).toBe(pendingRD);
					expect(remoteData.alt(initialRD, () => failureRD)).toBe(failureRD);
					expect(remoteData.alt(initialRD, () => successRD)).toBe(successRD);
				});
				it('pending', () => {
					expect(remoteData.alt(pendingRD, () => initialRD)).toBe(initialRD);
					expect(remoteData.alt(pendingRD, () => pendingRD)).toBe(pendingRD);
					expect(remoteData.alt(pendingRD, () => failureRD)).toBe(failureRD);
					expect(remoteData.alt(pendingRD, () => successRD)).toBe(successRD);
				});
				it('failure', () => {
					expect(remoteData.alt(failureRD, () => pendingRD)).toBe(pendingRD);
					expect(remoteData.alt(failureRD, () => initialRD)).toBe(initialRD);
					expect(remoteData.alt(failureRD, () => failureRD)).toBe(failureRD);
					expect(remoteData.alt(failureRD, () => successRD)).toBe(successRD);
				});
				it('failure', () => {
					expect(remoteData.alt(successRD, () => pendingRD)).toBe(successRD);
					expect(remoteData.alt(successRD, () => initialRD)).toBe(successRD);
					expect(remoteData.alt(successRD, () => failureRD)).toBe(successRD);
					expect(remoteData.alt(successRD, () => successRD)).toBe(successRD);
				});
			});
		});
		describe('Apply', () => {
			describe('should ap', () => {
				const f: RemoteData<string, (a: number) => number> = success(double);
				const failedF: RemoteData<string, (a: number) => number> = failure('foo');
				it('initial', () => {
					expect(remoteData.ap(initial, initialRD)).toBe(initialRD);
					expect(remoteData.ap(pending, initialRD)).toBe(initialRD);
					expect(remoteData.ap(progressRD, initialRD)).toBe(initialRD);
					expect(remoteData.ap(failedF, initialRD)).toBe(failedF);
					expect(remoteData.ap(f, initialRD)).toBe(initialRD);
				});
				it('pending', () => {
					expect(remoteData.ap(initial, pendingRD)).toBe(initial);
					expect(remoteData.ap(pending, pendingRD)).toBe(pendingRD);
					expect(remoteData.ap(progressRD, pendingRD)).toBe(progressRD);
					expect(remoteData.ap(failedF, pendingRD)).toBe(failedF);
					expect(remoteData.ap(f, pendingRD)).toBe(pendingRD);
				});
				it('failure', () => {
					expect(remoteData.ap(initial, failureRD)).toBe(failureRD);
					expect(remoteData.ap(pending, failureRD)).toBe(failureRD);
					expect(remoteData.ap(progressRD, failureRD)).toBe(failureRD);
					expect(remoteData.ap(failedF, failureRD)).toBe(failedF);
					expect(remoteData.ap(f, failureRD)).toBe(failureRD);
				});
				it('success', () => {
					expect(remoteData.ap(initial, successRD)).toBe(initial);
					expect(remoteData.ap(pending, successRD)).toBe(pending);
					expect(remoteData.ap(progressRD, successRD)).toBe(progressRD);
					expect(remoteData.ap(failedF, successRD)).toBe(failedF);
					expect(remoteData.ap(f, successRD)).toEqual(success(double(1)));
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
					expect(remoteData.chain(initialRD, () => initialRD)).toBe(initialRD);
					expect(remoteData.chain(initialRD, () => pendingRD)).toBe(initialRD);
					expect(remoteData.chain(initialRD, () => failureRD)).toBe(initialRD);
					expect(remoteData.chain(initialRD, () => successRD)).toBe(initialRD);
				});
				it('pending', () => {
					expect(remoteData.chain(pendingRD, () => initialRD)).toBe(pendingRD);
					expect(remoteData.chain(pendingRD, () => pendingRD)).toBe(pendingRD);
					expect(remoteData.chain(pendingRD, () => failureRD)).toBe(pendingRD);
					expect(remoteData.chain(pendingRD, () => successRD)).toBe(pendingRD);
				});
				it('failure', () => {
					expect(remoteData.chain(failureRD, () => initialRD)).toBe(failureRD);
					expect(remoteData.chain(failureRD, () => pendingRD)).toBe(failureRD);
					expect(remoteData.chain(failureRD, () => failureRD)).toBe(failureRD);
					expect(remoteData.chain(failureRD, () => successRD)).toBe(failureRD);
				});
				it('success', () => {
					expect(remoteData.chain(successRD, () => initialRD)).toBe(initialRD);
					expect(remoteData.chain(successRD, () => pendingRD)).toBe(pendingRD);
					expect(remoteData.chain(successRD, () => failureRD)).toBe(failureRD);
					expect(remoteData.chain(successRD, () => successRD)).toBe(successRD);
				});
			});
		});
		describe('Extend', () => {
			describe('extend', () => {
				const f = () => 1;
				it('initial', () => {
					expect(remoteData.extend(initialRD, f)).toBe(initialRD);
				});
				it('pending', () => {
					expect(remoteData.extend(pendingRD, f)).toBe(pendingRD);
				});
				it('failure', () => {
					expect(remoteData.extend(failureRD, f)).toBe(failureRD);
				});
				it('pending', () => {
					expect(remoteData.extend(successRD, f)).toEqual(success(1));
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
					expect(remoteData.reduce(initialRD, 1, f)).toBe(1);
					expect(remoteData.foldMap(monoidSum)(initialRD, g)).toBe(0);
					expect(remoteData.reduceRight(initialRD, 1, f)).toBe(1);
				});
				it('pending', () => {
					expect(remoteData.reduce(pendingRD, 1, f)).toBe(1);
					expect(remoteData.foldMap(monoidSum)(pendingRD, g)).toBe(0);
					expect(remoteData.reduceRight(pendingRD, 1, f)).toBe(1);
				});
				it('failure', () => {
					expect(remoteData.reduce(failureRD, 1, f)).toBe(1);
					expect(remoteData.foldMap(monoidSum)(failureRD, g)).toBe(0);
					expect(remoteData.reduceRight(failureRD, 1, f)).toBe(1);
				});
				it('success', () => {
					expect(remoteData.reduce(successRD, 1, f)).toBe(2);
					expect(remoteData.foldMap(monoidSum)(successRD, g)).toBe(2);
					expect(remoteData.reduceRight(successRD, 1, f)).toBe(2);
				});
			});
		});
		describe('Bifunctor', () => {
			describe('bimap', () => {
				const f = (l: string): string => `Error: ${l}`;
				const g = (a: number): number => a + 1;
				it('initial', () => {
					expect(remoteData.bimap(initialRD, f, g)).toBe(initial);
					expect(remoteData.bimap(initialRD, identity, identity)).toBe(initial);
				});
				it('pending', () => {
					expect(remoteData.bimap(pendingRD, f, g)).toBe(pending);
					expect(remoteData.bimap(pendingRD, identity, identity)).toBe(pending);
				});
				it('failure', () => {
					expect(remoteData.bimap(failureRD, f, g)).toEqual(remoteData.mapLeft(failureRD, f));
					expect(remoteData.bimap(failureRD, f, g)).toEqual(failure('Error: foo'));
					expect(remoteData.bimap(failureRD, identity, identity)).toEqual(failureRD);
				});
				it('success', () => {
					expect(remoteData.bimap(successRD, f, g)).toEqual(remoteData.map(successRD, g));
					expect(remoteData.bimap(successRD, f, g)).toEqual(success(2));
					expect(remoteData.bimap(successRD, identity, identity)).toEqual(successRD);
				});
			});
			describe('mapLeft', () => {
				const f2 = () => 1;
				it('initial', () => {
					expect(
						pipe(
							initialRD,
							mapLeft(f2),
						),
					).toBe(initialRD);
				});
				it('pending', () => {
					expect(
						pipe(
							pendingRD,
							mapLeft(f2),
						),
					).toBe(pendingRD);
				});
				it('failure', () => {
					expect(
						pipe(
							failureRD,
							mapLeft(f2),
						),
					).toEqual(failure(1));
				});
				it('success', () => {
					expect(
						pipe(
							successRD,
							mapLeft(f2),
						),
					).toBe(successRD);
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
					expect(concat(failure('foo'), failure('bar'))).toEqual(
						failure(semigroupString.concat('foo', 'bar')),
					);
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
						const withProgressAndTotal: RemoteData<string, number> = progress({
							loaded: 1,
							total: some(2),
						});
						expect(concat(withProgress, withProgressAndTotal)).toEqual(
							progress({ loaded: 2, total: none }),
						);
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
		describe('Show', () => {
			describe('getShow', () => {
				const { show } = getShow(showString, showNumber);
				it('initial', () => {
					expect(show(initialRD)).toBe('initial');
				});
				it('pending', () => {
					expect(show(pendingRD)).toBe('pending');
				});
				it('progress', () => {
					expect(show(progress({ loaded: 33, total: none }))).toBe('progress({ loaded: 33, total: none })');
					expect(show(progress({ loaded: 33, total: some(123) }))).toBe(
						'progress({ loaded: 33, total: some(123) })',
					);
				});
				it('failure', () => {
					expect(show(failure('foo'))).toBe('failure("foo")');
				});
				it('success', () => {
					expect(show(success(1))).toBe('success(1)');
				});
			});
		});
	});
	describe('top level', () => {
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
		describe('fold3', () => {
			it('initial', () => {
				expect(RD.fold3(() => 1, () => 2, () => 3)(initialRD)).toBe(1);
			});
			it('pending', () => {
				expect(RD.fold3(() => 1, () => 2, () => 3)(pendingRD)).toBe(1);
			});
			it('failure', () => {
				expect(RD.fold3(() => 1, () => 2, () => 3)(failureRD)).toBe(2);
			});
			it('success', () => {
				expect(RD.fold3(() => 1, () => 2, () => 3)(successRD)).toBe(3);
			});
		});
		describe('isInitial', () => {
			it('initial', () => {
				expect(isInitial(initialRD)).toBe(true);
			});
			it('pending', () => {
				expect(isInitial(pendingRD)).toBe(false);
			});
			it('failure', () => {
				expect(isInitial(failureRD)).toEqual(false);
			});
			it('success', () => {
				expect(isInitial(successRD)).toBe(false);
			});
		});
		describe('isPending', () => {
			it('initial', () => {
				expect(isPending(initialRD)).toBe(false);
			});
			it('pending', () => {
				expect(isPending(pendingRD)).toBe(true);
			});
			it('failure', () => {
				expect(isPending(failureRD)).toEqual(false);
			});
			it('success', () => {
				expect(isPending(successRD)).toBe(false);
			});
		});
		describe('isFailure', () => {
			it('initial', () => {
				expect(isFailure(initialRD)).toBe(false);
			});
			it('pending', () => {
				expect(isFailure(pendingRD)).toBe(false);
			});
			it('failure', () => {
				expect(isFailure(failureRD)).toEqual(true);
				if (isFailure(failureRD)) {
					expect(failureRD.error).toBeDefined();
				}
			});
			it('success', () => {
				expect(isFailure(successRD)).toBe(false);
			});
		});
		describe('isSuccess', () => {
			it('initial', () => {
				expect(isSuccess(initialRD)).toBe(false);
			});
			it('pending', () => {
				expect(isSuccess(pendingRD)).toBe(false);
			});
			it('failure', () => {
				expect(isSuccess(failureRD)).toEqual(false);
			});
			it('success', () => {
				expect(isSuccess(successRD)).toBe(true);
				if (isSuccess(successRD)) {
					expect(successRD.value).toBeDefined();
				}
			});
		});
		describe('toOption', () => {
			it('initial', () => {
				expect(toOption(initialRD)).toBe(none);
			});
			it('pending', () => {
				expect(toOption(pendingRD)).toBe(none);
			});
			it('failure', () => {
				expect(toOption(failureRD)).toBe(none);
			});
			it('success', () => {
				expect(toOption(success(1))).toEqual(some(1));
			});
		});
		describe('toEither', () => {
			const initialL = () => 'initial';
			const pendingL = () => 'pending';

			it('initial', () => {
				expect(
					pipe(
						initialRD,
						toEither(initialL, pendingL),
					),
				).toEqual(left('initial'));
			});
			it('pending', () => {
				expect(
					pipe(
						pendingRD,
						toEither(initialL, pendingL),
					),
				).toEqual(left('pending'));
			});
			it('failure', () => {
				expect(
					pipe(
						failureRD,
						toEither(initialL, pendingL),
					),
				).toEqual(left('foo'));
			});
			it('success', () => {
				expect(
					pipe(
						success(1),
						toEither(initialL, pendingL),
					),
				).toEqual(right(1));
			});
		});
		describe('toNullable', () => {
			it('initial', () => {
				expect(toNullable(initialRD)).toBe(null);
			});
			it('pending', () => {
				expect(toNullable(pendingRD)).toBe(null);
			});
			it('failure', () => {
				expect(toNullable(failureRD)).toBe(null);
			});
			it('success', () => {
				expect(toNullable(success(1))).toEqual(1);
			});
		});
		describe('elem', () => {
			it('initial', () => {
				expect(elem(eqNumber)(1, initialRD)).toBe(false);
			});
			it('pending', () => {
				expect(elem(eqNumber)(1, pendingRD)).toBe(false);
			});
			it('failure', () => {
				expect(elem(eqNumber)(1, failureRD)).toBe(false);
			});
			it('success', () => {
				expect(elem(eqNumber)(1, success(2))).toBe(false);
				expect(elem(eqNumber)(1, success(1))).toBe(true);
			});
		});
		describe('exists', () => {
			const p = (n: number) => n === 1;
			it('initial', () => {
				expect(
					pipe(
						initialRD,
						exists(p),
					),
				).toBe(false);
			});
			it('pending', () => {
				expect(
					pipe(
						pendingRD,
						exists(p),
					),
				).toBe(false);
			});
			it('failure', () => {
				expect(
					pipe(
						failureRD,
						exists(p),
					),
				).toBe(false);
			});
			it('success', () => {
				expect(
					pipe(
						success(2),
						exists(p),
					),
				).toBe(false);
				expect(
					pipe(
						success(1),
						exists(p),
					),
				).toBe(true);
			});
		});
		describe('recoverMap', () => {
			const f = (error: string) => (error === 'foo' ? some(true) : none);
			const isOdd = (n: number) => n % 2 === 0;
			it('initial', () => {
				expect(
					pipe(
						initialRD,
						recoverMap(f, isOdd),
					),
				).toBe(initialRD);
			});
			it('pending', () => {
				expect(
					pipe(
						pendingRD,
						recoverMap(f, isOdd),
					),
				).toBe(pendingRD);
			});
			it('failure', () => {
				expect(
					pipe(
						failure('foo'),
						recoverMap(f, isOdd),
					),
				).toEqual(success(true));
			});
			it('success', () => {
				expect(
					pipe(
						successRD,
						recoverMap(f, isOdd),
					),
				).toEqual(success(false));
			});
		});
		describe('instance methods', () => {
			describe('recover', () => {
				const f = (error: string) => (error === 'foo' ? some(1) : none);
				it('initial', () => {
					expect(
						pipe(
							initialRD,
							recover(f),
						),
					).toBe(initialRD);
				});
				it('pending', () => {
					expect(
						pipe(
							pendingRD,
							recover(f),
						),
					).toBe(pendingRD);
				});
				it('failure', () => {
					expect(
						pipe(
							failure('foo'),
							recover(f),
						),
					).toEqual(success(1));
				});
				it('success', () => {
					expect(
						pipe(
							successRD,
							recover(f),
						),
					).toBe(successRD);
				});
			});
		});
	});

	it('types are inferred correctly when chaining', () => {
		const fa: RemoteData<string, number> = RD.success(1);
		pipe(
			fa,
			RD.chain(a => success(a)),
		);
	});
});
