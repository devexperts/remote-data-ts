import { constFalse, FunctionN, Lazy, Predicate, identity, constant, Endomorphism } from 'fp-ts/lib/function';
import { Monad2 } from 'fp-ts/lib/Monad';
import { Foldable2 } from 'fp-ts/lib/Foldable';
import { Alt2 } from 'fp-ts/lib/Alt';
import { Extend2 } from 'fp-ts/lib/Extend';
import { Traversable2 } from 'fp-ts/lib/Traversable';
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor';
import { isNone, isSome, none, Option, some, fold as foldO, getShow as getShowOption } from 'fp-ts/lib/Option';
import { Either, left, right, fold as foldEither } from 'fp-ts/lib/Either';
import { Eq } from 'fp-ts/lib/Eq';

import { array } from 'fp-ts/lib/Array';

import { HKT } from 'fp-ts/lib/HKT';
import { Applicative } from 'fp-ts/lib/Applicative';
import { Alternative2 } from 'fp-ts/lib/Alternative';
import { Ord } from 'fp-ts/lib/Ord';
import { sign } from 'fp-ts/lib/Ordering';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import { Monoid } from 'fp-ts/lib/Monoid';
import { pipe, pipeable } from 'fp-ts/lib/pipeable';
import { Show, showNumber } from 'fp-ts/lib/Show';

export const URI = 'RemoteData';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
	interface URItoKind2<E, A> {
		RemoteData: RemoteData<E, A>;
	}
}

export type RemoteProgress = {
	readonly loaded: number;
	readonly total: Option<number>;
};

export type RemoteInitial = {
	readonly _tag: 'RemoteInitial';
};

export type RemotePending = {
	readonly _tag: 'RemotePending';
	readonly progress: Option<RemoteProgress>;
};

export type RemoteFailure<E> = {
	readonly _tag: 'RemoteFailure';
	readonly error: E;
};

export type RemoteSuccess<A> = {
	readonly _tag: 'RemoteSuccess';
	readonly value: A;
};

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of {@link RemoteData} is either an instance of {@link RemoteInitial}, {@link RemotePending}, {@link RemoteFailure} or {@link RemoteSuccess}
 *
 * A common use of {@link RemoteData} is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * Note: {@link RemoteInitial}, {@link RemotePending} and {@link RemoteFailure} are commonly called "Left" part in jsDoc.
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 */
export type RemoteData<E, A> = RemoteInitial | RemotePending | RemoteFailure<E> | RemoteSuccess<A>;

//constructors
export const failure = <E>(error: E): RemoteData<E, never> => ({
	_tag: 'RemoteFailure',
	error,
});
export const success = <A>(value: A): RemoteData<never, A> => ({
	_tag: 'RemoteSuccess',
	value,
});
export const pending: RemoteData<never, never> = {
	_tag: 'RemotePending',
	progress: none,
};
export const progress = (progress: RemoteProgress): RemoteData<never, never> => ({
	_tag: 'RemotePending',
	progress: some(progress),
});
export const initial: RemoteData<never, never> = {
	_tag: 'RemoteInitial',
};

//filters
/**
 * Returns true only if {@link RemoteData} is {@link RemoteFailure}
 */
export const isFailure = <E>(data: RemoteData<E, unknown>): data is RemoteFailure<E> => data._tag === 'RemoteFailure';

/**
 * Returns true only if {@link RemoteData} is {@link RemoteSuccess}
 */
export const isSuccess = <A>(data: RemoteData<unknown, A>): data is RemoteSuccess<A> => data._tag === 'RemoteSuccess';

/**
 * Returns true only if {@link RemoteData} is {@link RemotePending}
 */
export const isPending = (data: RemoteData<unknown, unknown>): data is RemotePending => data._tag === 'RemotePending';

/**
 * Returns true only if {@link RemoteData} is {@link RemoteInitial}
 */
export const isInitial = (data: RemoteData<unknown, unknown>): data is RemoteInitial => data._tag === 'RemoteInitial';

/**
 * Takes a default value as an argument.
 * If this {@link RemoteData} is "Left" part it will return default value.
 * If this {@link RemoteData} is {@link RemoteSuccess} it will return it's value ("wrapped" value, not default value)
 *
 * Note: Default value should be the same type as {@link RemoteData} (internal) value, if you want to pass different type as default, use {@link fold}.
 *
 * @example
 * getOrElse(() => 999)(some(1)) // 1
 * getOrElseValue(() => 999)(initial) // 999
 */
export const getOrElse = <L, A>(f: Lazy<A>) => (ma: RemoteData<L, A>): A => (isSuccess(ma) ? ma.value : f());

/**
 * Needed for "unwrap" value from {@link RemoteData} "container".
 * It applies a function to each case in the data structure.
 *
 * @example
 * const onInitial = () => "it's initial"
 * const onPending = () => "it's pending"
 * const onFailure = (err) => "it's failure"
 * const onSuccess = (data) => `${data + 1}`
 * const f = fold(onInitial, onPending, onFailure, onSuccess)
 *
 * f(initial) // "it's initial"
 * f(pending) // "it's pending"
 * f(failure(new Error('error text'))) // "it's failure"
 * f(success(21)) // '22'
 */
export const fold = <E, A, B>(
	onInitial: () => B,
	onPending: (progress: Option<RemoteProgress>) => B,
	onFailure: (error: E) => B,
	onSuccess: (value: A) => B,
) => (ma: RemoteData<E, A>): B => {
	switch (ma._tag) {
		case 'RemoteInitial': {
			return onInitial();
		}
		case 'RemotePending': {
			return onPending(ma.progress);
		}
		case 'RemoteFailure': {
			return onFailure(ma.error);
		}
		case 'RemoteSuccess': {
			return onSuccess(ma.value);
		}
	}
};

/**
 * A more concise way to "unwrap" values from {@link RemoteData} "container".
 * It uses fold in its implementation, collapsing `onInitial` and `onPending` on the `onNone` handler.
 * When fold's `onInitial` returns, `onNode` is called with `none`.
 *
 * @example
 * const onNone = (progressOption) => "no data to show"
 * const onFailure = (err) => "sorry, the request failed"
 * const onSuccess = (data) => `result is: ${data + 1}`
 * const f = fold(onInitial, onPending, onFailure, onSuccess)
 *
 * f(initial) // "no data to show"
 * f(pending) // "no data to show"
 * f(failure(new Error('error text'))) // "sorry, the request failed"
 * f(success(21)) // "result is: 22"
 */
export const fold3 = <E, A, R>(
	onNone: (progress: Option<RemoteProgress>) => R,
	onFailure: (e: E) => R,
	onSuccess: (a: A) => R,
): ((fa: RemoteData<E, A>) => R) => fold(() => onNone(none), onNone, onFailure, onSuccess);

/**
 * One more way to fold (unwrap) value from {@link RemoteData}.
 * `Left` part will return `null`.
 * {@link RemoteSuccess} will return value.
 *
 * For example:
 *
 * `success(2).toNullable() will return 2`
 *
 * `initial.toNullable() will return null`
 *
 * `pending.toNullable() will return null`
 *
 * `failure(new Error('error text)).toNullable() will return null`
 *
 */
export const toNullable = <L, A>(ma: RemoteData<L, A>): A | null => (isSuccess(ma) ? ma.value : null);

export const toUndefined = <L, A>(ma: RemoteData<L, A>): A | undefined => (isSuccess(ma) ? ma.value : undefined);

export function fromOption<L, A>(option: Option<A>, error: Lazy<L>): RemoteData<L, A> {
	if (isNone(option)) {
		return failure(error());
	} else {
		return success(option.value);
	}
}

/**
 * Convert {@link RemoteData} to {@link Option}
 * `Left` part will be converted to {@link None}.
 * {@link RemoteSuccess} will be converted to {@link Some}.
 *
 * @example
 * toOption(success(2)) // some(2)
 * toOption(initial) // none
 * toOption(pending) // none
 * toOption(failure(new Error('error text'))) // none
 */
export function toOption<E, A>(data: RemoteData<E, A>): Option<A> {
	return data._tag === 'RemoteSuccess' ? some(data.value) : none;
}

/**
 * Creates {@link RemoteData} from {@link Either}
 */
export const fromEither: <E, A>(ea: Either<E, A>) => RemoteData<E, A> = foldEither(failure, success as any);

/**
 * Convert {@link RemoteData} to `Either`.
 * `Left` part will be converted to `Left<L>`.
 * Since {@link RemoteInitial} and {@link RemotePending} do not have `L` values,
 * you must provide a value of type `L` that will be used to construct
 * the `Left<L>` for those two cases.
 * {@link RemoteSuccess} will be converted to `Right<R>`.
 *
 * @example:
 * const f = toEither(
 * 		() => new Error('Data not fetched'),
 * 		() => new Error('Data is fetching')
 * )
 * f(success(2)) // right(2)
 * f(initial) // right(Error('Data not fetched'))
 * f(pending) // right(Error('Data is fetching'))
 * f(failure(new Error('error text'))) // right(Error('error text'))
 */
export function toEither<E>(onInitial: () => E, onPending: () => E): <A>(data: RemoteData<E, A>) => Either<E, A> {
	return data =>
		pipe(
			data,
			fold(() => left(onInitial()), () => left(onPending()), left, right),
		);
}

export function fromPredicate<L, A>(
	predicate: Predicate<A>,
	whenFalse: FunctionN<[A], L>,
): FunctionN<[A], RemoteData<L, A>> {
	return a => (predicate(a) ? success(a) : failure(whenFalse(a)));
}

/**
 * Create {@link RemoteData} from {@link ProgressEvent}
 * @param event
 */
export function fromProgressEvent(event: ProgressEvent): RemoteData<never, never> {
	return progress({
		loaded: event.loaded,
		total: event.lengthComputable ? some(event.total) : none,
	});
}

/**
 * Compare values and returns `true` if they are identical, otherwise returns `false`.
 * `Left` part will return `false`.
 * {@link RemoteSuccess} will call {@link Eq.equals}.
 *
 * If you want to compare {@link RemoteData}'s values better use {@link getEq} or {@link getOrd} helpers.
 *
 */
export function elem<A>(E: Eq<A>): (a: A, fa: RemoteData<unknown, A>) => boolean {
	return (a, fa) => fa._tag === 'RemoteSuccess' && E.equals(a, fa.value);
}

/**
 * Takes a predicate and apply it to {@link RemoteSuccess} value.
 * `Left` part will return `false`.
 */
export function exists<A>(p: Predicate<A>): (fa: RemoteData<unknown, A>) => boolean {
	return fa => fa._tag === 'RemoteSuccess' && p(fa.value);
}

/**
 * Maps this RemoteFailure error into RemoteSuccess if passed function `f` return {@link Some} value, otherwise returns self
 */
export function recover<E, A>(f: (error: E) => Option<A>): (fa: RemoteData<E, A>) => RemoteData<E, A> {
	const r: Endomorphism<RemoteData<E, A>> = recoverMap(f, identity);
	return fa => (fa._tag === 'RemoteFailure' ? r(fa) : fa);
}

/**
 * Recovers {@link RemoteFailure} also mapping {@link RemoteSuccess} case
 * @see {@link recover}
 */
export function recoverMap<E, A, B>(
	f: (error: E) => Option<B>,
	g: (value: A) => B,
): (fa: RemoteData<E, A>) => RemoteData<E, B> {
	return fa => {
		switch (fa._tag) {
			case 'RemoteInitial': {
				return fa;
			}
			case 'RemotePending': {
				return fa;
			}
			case 'RemoteFailure': {
				const b = f(fa.error);
				return b._tag === 'Some' ? success(b.value) : fa;
			}
			case 'RemoteSuccess': {
				return success(g(fa.value));
			}
		}
	};
}

const concatPendings = <L, A>(a: RemotePending, b: RemotePending): RemoteData<L, A> => {
	if (isSome(a.progress) && isSome(b.progress)) {
		const progressA = a.progress.value;
		const progressB = b.progress.value;
		if (isNone(progressA.total) || isNone(progressB.total)) {
			return progress({
				loaded: progressA.loaded + progressB.loaded,
				total: none,
			});
		}
		const totalA = progressA.total.value;
		const totalB = progressB.total.value;
		const total = totalA + totalB;
		const loaded = (progressA.loaded * totalA + progressB.loaded * totalB) / (total * total);
		return progress({
			loaded,
			total: some(total),
		});
	}
	const noA = isNone(a.progress);
	const noB = isNone(b.progress);
	if (noA && !noB) {
		return b;
	}
	if (!noA && noB) {
		return a;
	}
	return pending;
};

//instance
export const remoteData: Monad2<URI> &
	Foldable2<URI> &
	Traversable2<URI> &
	Bifunctor2<URI> &
	Alt2<URI> &
	Extend2<URI> &
	Alternative2<URI> = {
	//HKT
	URI,

	//Monad
	of: <A>(value: A): RemoteData<never, A> => success(value),
	ap: <E, A, B>(fab: RemoteData<E, FunctionN<[A], B>>, fa: RemoteData<E, A>): RemoteData<E, B> => {
		switch (fa._tag) {
			case 'RemoteInitial': {
				return isFailure(fab) ? fab : initial;
			}
			case 'RemotePending': {
				return isPending(fab) ? concatPendings(fa, fab) : isSuccess(fab) ? fa : fab;
			}
			case 'RemoteFailure': {
				return isFailure(fab) ? fab : fa;
			}
			case 'RemoteSuccess': {
				return isSuccess(fab) ? success(fab.value(fa.value)) : fab;
			}
		}
	},
	map: <L, A, B>(fa: RemoteData<L, A>, f: FunctionN<[A], B>): RemoteData<L, B> =>
		isSuccess(fa) ? success(f(fa.value)) : fa,
	chain: <L, A, B>(fa: RemoteData<L, A>, f: FunctionN<[A], RemoteData<L, B>>): RemoteData<L, B> =>
		isSuccess(fa) ? f(fa.value) : fa,

	//Foldable
	reduce: <L, A, B>(fa: RemoteData<L, A>, b: B, f: FunctionN<[B, A], B>): B =>
		pipe(
			fa,
			fold(() => b, () => b, () => b, a => f(b, a)),
		),
	reduceRight: <L, A, B>(fa: RemoteData<L, A>, b: B, f: (a: A, b: B) => B): B => (isSuccess(fa) ? f(fa.value, b) : b),
	foldMap: <M>(M: Monoid<M>) => <L, A>(fa: RemoteData<L, A>, f: (a: A) => M): M =>
		isSuccess(fa) ? f(fa.value) : M.empty,

	//Traversable
	traverse: <F>(F: Applicative<F>) => <E, A, B>(
		ta: RemoteData<E, A>,
		f: (a: A) => HKT<F, B>,
	): HKT<F, RemoteData<E, B>> => {
		if (isSuccess(ta)) {
			return F.map(f(ta.value), a => remoteData.of(a));
		} else {
			return F.of(ta);
		}
	},
	sequence: <F>(F: Applicative<F>) => <L, A>(ta: RemoteData<L, HKT<F, A>>): HKT<F, RemoteData<L, A>> =>
		remoteData.traverse(F)(ta, identity),

	//Bifunctor
	bimap: <L, V, A, B>(fla: RemoteData<L, A>, f: (u: L) => V, g: (a: A) => B): RemoteData<V, B> =>
		pipe(
			fla,
			fold<L, A, RemoteData<V, B>>(
				() => initial,
				foldO(() => pending, progress),
				e => failure(f(e)),
				a => success(g(a)),
			),
		),
	mapLeft: <L, V, A>(fla: RemoteData<L, A>, f: (u: L) => V): RemoteData<V, A> =>
		fold<L, A, RemoteData<V, A>>(
			() => initial,
			foldO(() => pending, progress),
			e => failure(f(e)),
			() => fla as any,
		)(fla),

	//Alt
	alt: <L, A>(fx: RemoteData<L, A>, fy: () => RemoteData<L, A>): RemoteData<L, A> => fold(fy, fy, fy, () => fx)(fx),

	//Alternative
	zero: <L, A>(): RemoteData<L, A> => initial,

	//Extend
	extend: <L, A, B>(fla: RemoteData<L, A>, f: FunctionN<[RemoteData<L, A>], B>): RemoteData<L, B> =>
		pipe(
			fla,
			fold<L, A, RemoteData<L, B>>(
				() => initial,
				foldO(() => pending, progress),
				() => fla as any,
				() => success(f(fla)),
			),
		),
};

//Eq
export const getEq = <E, A>(EE: Eq<E>, EA: Eq<A>): Eq<RemoteData<E, A>> => {
	return {
		equals: (x, y) =>
			pipe(
				x,
				fold(
					() => isInitial(y),
					() => isPending(y),
					xError =>
						pipe(
							y,
							fold(constFalse, constFalse, yError => EE.equals(xError, yError), constFalse),
						),
					ax =>
						pipe(
							y,
							fold(constFalse, constFalse, constFalse, ay => EA.equals(ax, ay)),
						),
				),
			),
	};
};

//Ord
const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
export const getOrd = <E, A>(OE: Ord<E>, OA: Ord<A>): Ord<RemoteData<E, A>> => {
	return {
		...getEq(OE, OA),
		compare: (x, y) =>
			sign(
				pipe(
					x,
					fold(
						() =>
							pipe(
								y,
								fold(constEq, constLt, constLt, constLt),
							),
						() =>
							pipe(
								y,
								fold(constGt, constEq, constLt, constLt),
							),
						xError =>
							pipe(
								y,
								fold(constGt, constGt, yError => OE.compare(xError, yError), constLt),
							),
						xValue =>
							pipe(
								y,
								fold(constGt, constGt, constGt, yValue => OA.compare(xValue, yValue)),
							),
					),
				),
			),
	};
};

//Semigroup
export const getSemigroup = <E, A>(SE: Semigroup<E>, SA: Semigroup<A>): Semigroup<RemoteData<E, A>> => {
	return {
		concat: (x, y) => {
			const constX = constant(x);
			const constY = constant(y);
			return pipe(
				x,
				fold(
					() =>
						pipe(
							y,
							fold(constY, constY, constY, constY),
						),
					() =>
						pipe(
							y,
							fold(constX, () => concatPendings(x as RemotePending, y as RemotePending), constY, constY),
						),

					xError =>
						pipe(
							y,
							fold(constX, constX, yError => failure(SE.concat(xError, yError)), () => y),
						),
					xValue =>
						pipe(
							y,
							fold(constX, constX, () => x, yValue => success(SA.concat(xValue, yValue))),
						),
				),
			);
		},
	};
};

//Monoid
export const getMonoid = <L, A>(SL: Semigroup<L>, SA: Semigroup<A>): Monoid<RemoteData<L, A>> => {
	return {
		...getSemigroup(SL, SA),
		empty: initial,
	};
};

const showOptionNumber = getShowOption(showNumber);
//Show
export const getShow = <E, A>(SE: Show<E>, SA: Show<A>): Show<RemoteData<E, A>> => ({
	show: fold(
		() => 'initial',
		foldO(
			() => 'pending',
			progress =>
				`progress({ loaded: ${showNumber.show(progress.loaded)}, total: ${showOptionNumber.show(
					progress.total,
				)} })`,
		),
		e => `failure(${SE.show(e)})`,
		a => `success(${SA.show(a)})`,
	),
});

const {
	alt,
	ap,
	apFirst,
	apSecond,
	bimap,
	chain,
	chainFirst,
	duplicate,
	extend,
	flatten,
	foldMap,
	map,
	mapLeft,
	reduce,
	reduceRight,
} = pipeable(remoteData);

export {
	alt,
	ap,
	apFirst,
	apSecond,
	bimap,
	chain,
	chainFirst,
	duplicate,
	extend,
	flatten,
	foldMap,
	map,
	mapLeft,
	reduce,
	reduceRight,
};

export function combine<A, L>(a: RemoteData<L, A>): RemoteData<L, [A]>;
export function combine<A, B, L>(a: RemoteData<L, A>, b: RemoteData<L, B>): RemoteData<L, [A, B]>;
export function combine<A, B, C, L>(
	a: RemoteData<L, A>,
	b: RemoteData<L, B>,
	c: RemoteData<L, C>,
): RemoteData<L, [A, B, C]>;
export function combine<A, B, C, D, L>(
	a: RemoteData<L, A>,
	b: RemoteData<L, B>,
	c: RemoteData<L, C>,
	d: RemoteData<L, D>,
): RemoteData<L, [A, B, C, D]>;
export function combine<A, B, C, D, E, L>(
	a: RemoteData<L, A>,
	b: RemoteData<L, B>,
	c: RemoteData<L, C>,
	d: RemoteData<L, D>,
	e: RemoteData<L, E>,
): RemoteData<L, [A, B, C, D, E]>;
export function combine<A, B, C, D, E, F, L>(
	a: RemoteData<L, A>,
	b: RemoteData<L, B>,
	c: RemoteData<L, C>,
	d: RemoteData<L, D>,
	e: RemoteData<L, E>,
	f: RemoteData<L, F>,
): RemoteData<L, [A, B, C, D, E, F]>;
export function combine<T, L>(...list: RemoteData<L, T>[]): RemoteData<L, T[]> {
	if (list.length === 0) {
		return remoteData.of([]);
	}
	return array.sequence(remoteData)(list);
}
