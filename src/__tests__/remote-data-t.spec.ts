import { pipe, pipeable } from 'fp-ts/lib/pipeable';
import { getRemoteDataM, RemoteDataM1, RemoteDataT1 } from '../remote-data-t';
import { flow, identity } from 'fp-ts/lib/function';
import { none, option, some } from 'fp-ts/lib/Option';
import { array } from 'fp-ts/lib/Array';
import { Monad2 } from 'fp-ts/lib/Monad';

declare module 'fp-ts/lib/HKT' {
	interface URItoKind2<E, A> {
		RemoteDataT1Option: RemoteDataT1<'Option', E, A>;
	}
}
const M: RemoteDataM1<'Option'> & Monad2<'RemoteDataT1Option'> = {
	URI: 'RemoteDataT1Option',
	...getRemoteDataM(option),
};
const P = pipeable(M);
const double = (x: number) => x * 2;
const successM = M.of<string, number>(1);
const failureM = M.failure('foo');
const progressM = M.progress({ loaded: 1, total: none });

describe('RemoteDataT', () => {
	describe('typeclasses', () => {
		describe('Functor', () => {
			describe('should map over value', () => {
				it('initial', async () => {
					expect(M.map(M.initial, double)).toEqual(M.initial);
				});
				it('pending', async () => {
					expect(M.map(M.pending, double)).toEqual(M.pending);
				});
				it('failure', async () => {
					const failed = M.failure('foo');
					expect(M.map(failed, double)).toEqual(failed);
				});
				it('success', async () => {
					const value = 123;
					const succeeded = M.of(value);
					const result = M.map(succeeded, double);
					expect(result).toEqual(M.of(value * 2));
				});
			});
			describe('laws', () => {
				describe('identity', () => {
					it('initial', () => {
						expect(M.map(M.initial, identity)).toEqual(M.initial);
					});
					it('pending', () => {
						expect(M.map(M.pending, identity)).toEqual(M.pending);
					});
					it('failure', () => {
						const failed = M.failure('foo');
						expect(M.map(failed, identity)).toEqual(failed);
					});
					it('success', () => {
						const succeeded = M.of('foo');
						const result = M.map(succeeded, identity);
						expect(result).toEqual(succeeded);
					});
				});
				describe('composition', () => {
					const double = (a: number): number => a * 2;
					const quad = flow(
						double,
						double,
					);
					it('initial', () => {
						expect(M.map(M.initial, quad)).toEqual(
							pipe(
								M.initial,
								P.map(double),
								P.map(double),
							),
						);
					});
					it('pending', () => {
						expect(M.map(M.pending, quad)).toEqual(
							pipe(
								M.pending,
								P.map(double),
								P.map(double),
							),
						);
					});
					it('failure', () => {
						const failed = M.failure('foo');
						expect(M.map(failed, quad)).toEqual(
							pipe(
								failed,
								P.map(double),
								P.map(double),
							),
						);
					});
					it('success', () => {
						const value = 1;
						const succeeded = M.of(value);
						expect(M.map(succeeded, quad)).toEqual(M.of(quad(value)));
					});
				});
			});
		});
		describe('Alt', () => {
			describe('should alt', () => {
				it('initial', () => {
					expect(M.alt(M.initial, () => M.initial)).toEqual(M.initial);
					expect(M.alt(M.initial, () => M.pending)).toEqual(M.pending);
					expect(M.alt(M.initial, () => failureM)).toEqual(failureM);
					expect(M.alt(M.initial, () => successM)).toEqual(successM);
				});
				it('pending', () => {
					expect(M.alt(M.pending, () => M.initial)).toEqual(M.initial);
					expect(M.alt(M.pending, () => M.pending)).toEqual(M.pending);
					expect(M.alt(M.pending, () => failureM)).toEqual(failureM);
					expect(M.alt(M.pending, () => successM)).toEqual(successM);
				});
				it('failure', () => {
					expect(M.alt(failureM, () => M.pending)).toEqual(M.pending);
					expect(M.alt(failureM, () => M.initial)).toEqual(M.initial);
					expect(M.alt(failureM, () => failureM)).toEqual(failureM);
					expect(M.alt(failureM, () => successM)).toEqual(successM);
				});
				it('failure', () => {
					expect(M.alt(successM, () => M.pending)).toEqual(successM);
					expect(M.alt(successM, () => M.initial)).toEqual(successM);
					expect(M.alt(successM, () => failureM)).toEqual(successM);
					expect(M.alt(successM, () => successM)).toEqual(successM);
				});
			});
		});
		describe('Apply', () => {
			describe('should ap', () => {
				const f = M.of(double);
				const failedF = M.failure('foo');
				it('initial', () => {
					expect(M.ap(M.initial, M.initial)).toEqual(M.initial);
					expect(M.ap(M.pending, M.initial)).toEqual(M.initial);
					expect(M.ap(progressM, M.initial)).toEqual(M.initial);
					expect(M.ap(failedF, M.initial)).toEqual(failedF);
					expect(M.ap(f, M.initial)).toEqual(M.initial);
				});
				it('pending', () => {
					expect(M.ap(M.initial, M.pending)).toEqual(M.initial);
					expect(M.ap(M.pending, M.pending)).toEqual(M.pending);
					expect(M.ap(progressM, M.pending)).toEqual(progressM);
					expect(M.ap(failedF, M.pending)).toEqual(failedF);
					expect(M.ap(f, M.pending)).toEqual(M.pending);
				});
				it('failure', () => {
					expect(M.ap(M.initial, failureM)).toEqual(failureM);
					expect(M.ap(M.pending, failureM)).toEqual(failureM);
					expect(M.ap(progressM, failureM)).toEqual(failureM);
					expect(M.ap(failedF, failureM)).toEqual(failedF);
					expect(M.ap(f, failureM)).toEqual(failureM);
				});
				it('success', () => {
					expect(M.ap(M.initial, successM)).toEqual(M.initial);
					expect(M.ap(M.pending, successM)).toEqual(M.pending);
					expect(M.ap(progressM, successM)).toEqual(progressM);
					expect(M.ap(failedF, successM)).toEqual(failedF);
					expect(M.ap(f, successM)).toEqual(M.of(double(1)));
				});
			});
		});
		describe('Applicative', () => {
			describe('sequence', () => {
				const s = array.sequence(M);
				it('initial', () => {
					expect(s([M.initial, successM])).toEqual(M.initial);
				});
				it('pending', () => {
					expect(s([M.pending, successM])).toEqual(M.pending);
				});
				it('failure', () => {
					expect(s([failureM, successM])).toEqual(failureM);
				});
				it('success', () => {
					expect(s([M.of(123), M.of(456)])).toEqual(M.of([123, 456]));
				});
			});
		});
		describe('Chain', () => {
			describe('chain', () => {
				it('initial', () => {
					expect(M.chain(M.initial, () => M.initial)).toEqual(M.initial);
					expect(M.chain(M.initial, () => M.pending)).toEqual(M.initial);
					expect(M.chain(M.initial, () => failureM)).toEqual(M.initial);
					expect(M.chain(M.initial, () => successM)).toEqual(M.initial);
				});
				it('pending', () => {
					expect(M.chain(M.pending, () => M.initial)).toEqual(M.pending);
					expect(M.chain(M.pending, () => M.pending)).toEqual(M.pending);
					expect(M.chain(M.pending, () => failureM)).toEqual(M.pending);
					expect(M.chain(M.pending, () => successM)).toEqual(M.pending);
				});
				it('failure', () => {
					expect(M.chain(failureM, () => M.initial)).toEqual(failureM);
					expect(M.chain(failureM, () => M.pending)).toEqual(failureM);
					expect(M.chain(failureM, () => failureM)).toEqual(failureM);
					expect(M.chain(failureM, () => successM)).toEqual(failureM);
				});
				it('success', () => {
					expect(M.chain(successM, () => M.initial)).toEqual(M.initial);
					expect(M.chain(successM, () => M.pending)).toEqual(M.pending);
					expect(M.chain(successM, () => failureM)).toEqual(failureM);
					expect(M.chain(successM, () => successM)).toEqual(successM);
				});
			});
		});
		describe('Bifunctor', () => {
			describe('bimap', () => {
				const f = (l: string): string => `Error: ${l}`;
				const g = (a: number): number => a + 1;
				it('initial', () => {
					expect(M.bimap(M.initial, f, g)).toEqual(M.initial);
					expect(M.bimap(M.initial, identity, identity)).toEqual(M.initial);
				});
				it('pending', () => {
					expect(M.bimap(M.pending, f, g)).toEqual(M.pending);
					expect(M.bimap(M.pending, identity, identity)).toEqual(M.pending);
				});
				it('failure', () => {
					expect(M.bimap(failureM, f, g)).toEqual(M.mapLeft(failureM, f));
					expect(M.bimap(failureM, f, g)).toEqual(M.failure('Error: foo'));
					expect(M.bimap(failureM, identity, identity)).toEqual(failureM);
				});
				it('success', () => {
					expect(M.bimap(successM, f, g)).toEqual(M.map(successM, g));
					expect(M.bimap(successM, f, g)).toEqual(M.of(2));
					expect(M.bimap(successM, identity, identity)).toEqual(successM);
				});
			});
			describe('mapLeft', () => {
				const f2 = () => 1;
				it('initial', () => {
					expect(M.mapLeft(M.initial, f2)).toEqual(M.initial);
				});
				it('pending', () => {
					expect(M.mapLeft(M.pending, f2)).toEqual(M.pending);
				});
				it('failure', () => {
					expect(M.mapLeft(failureM, f2)).toEqual(M.failure(1));
				});
				it('success', () => {
					expect(M.mapLeft(successM, f2)).toEqual(successM);
				});
			});
		});
	});

	describe('top-level', () => {
		describe('fromOption', () => {
			const error = new Error('foo');
			it('none', () => {
				expect(M.fromOption(none, () => error)).toEqual(M.failure(error));
			});
			it('some', () => {
				expect(M.fromOption(some(123), () => error)).toEqual(M.of(123));
			});
		});
	});
});
