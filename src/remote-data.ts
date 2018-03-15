import { constFalse, Function2, Function1, Lazy, toString, Predicate } from 'fp-ts/lib/function';
import { Monad2 } from 'fp-ts/lib/Monad';
import { Foldable2 } from 'fp-ts/lib/Foldable';
import { Alt2 } from 'fp-ts/lib/Alt';
import { Extend2 } from 'fp-ts/lib/Extend';
import { sequence, Traversable2 } from 'fp-ts/lib/Traversable';
import { isNone, none, Option, some } from 'fp-ts/lib/Option';
import { Either, isLeft } from 'fp-ts/lib/Either';
import { Setoid } from 'fp-ts/lib/Setoid';

import { array } from 'fp-ts/lib/Array';

import { HKT, HKT2, Type, Type2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Applicative } from 'fp-ts/lib/Applicative';
import { Alternative2 } from 'fp-ts/lib/Alternative';
import { Ord } from 'fp-ts/lib/Ord';
import { sign } from 'fp-ts/lib/Ordering';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import { Monoid } from 'fp-ts/lib/Monoid';

export const URI = 'RemoteData';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
	interface URI2HKT2<L, A> {
		RemoteData: RemoteData<L, A>;
	}
}

export class RemoteInitial<L, A> {
	readonly _tag: 'RemoteInitial' = 'RemoteInitial';
	// prettier-ignore
	readonly '_URI': URI;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return initial;
	}

	foldL<B>(initial: Lazy<B>, pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
		return initial();
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: Function1<A, B>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	isPending(): this is RemotePending<L, A> {
		return false;
	}

	isFailure(): this is RemoteFailure<L, A> {
		return false;
	}

	isSuccess(): this is RemoteSuccess<L, A> {
		return false;
	}

	isInitial(): this is RemoteInitial<L, A> {
		return true;
	}

	toOption(): Option<A> {
		return none;
	}

	toNullable(): A | null {
		return null;
	}

	toString(): string {
		return 'initial';
	}

	contains(S: Setoid<A>, a: A): boolean {
		return false;
	}

	exists(p: Predicate<A>): boolean {
		return false;
	}
}

export class RemoteFailure<L, A> {
	readonly _tag: 'RemoteFailure' = 'RemoteFailure';
	// prettier-ignore
	readonly '_URI': URI;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	constructor(readonly error: L) {}

	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return fab.fold(initial, pending, () => fab as any, () => this); //tslint:disable-line no-use-before-declare
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return this as any;
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return this as any;
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return failure(this.error);
	}

	foldL<B>(initial: Lazy<B>, pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
		return failure(this.error);
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData<L, B> {
		return this as any;
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return failure(f(this.error)); //tslint:disable-line no-use-before-declare
	}

	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	isInitial(): this is RemoteInitial<L, A> {
		return false;
	}

	isPending(): this is RemotePending<L, A> {
		return false;
	}

	isFailure(): this is RemoteFailure<L, A> {
		return true;
	}

	isSuccess(): this is RemoteSuccess<L, A> {
		return false;
	}

	toOption(): Option<A> {
		return none;
	}

	toNullable(): A | null {
		return null;
	}

	toString(): string {
		return `failure(${toString(this.error)})`;
	}

	contains(S: Setoid<A>, a: A): boolean {
		return false;
	}

	exists(p: Predicate<A>): boolean {
		return false;
	}
}

export class RemoteSuccess<L, A> {
	readonly _tag: 'RemoteSuccess' = 'RemoteSuccess';
	// prettier-ignore
	readonly '_URI': URI;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	constructor(readonly value: A) {}

	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return this;
	}

	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return this;
	}

	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return fab.fold(initial, pending, () => fab as any, value => this.map(value)); //tslint:disable-line no-use-before-declare
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return f(this.value);
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return of(f(this)); //tslint:disable-line no-use-before-declare
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return success(this.value);
	}

	foldL<B>(initial: Lazy<B>, pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
		return success(this.value);
	}

	getOrElseL(f: Lazy<A>): A {
		return this.value;
	}

	map<B>(f: Function1<A, B>): RemoteData<L, B> {
		return of(f(this.value)); //tslint:disable-line no-use-before-declare
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return this as any;
	}

	getOrElse(value: A): A {
		return this.value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return f(b, this.value);
	}

	isInitial(): this is RemoteInitial<L, A> {
		return false;
	}

	isPending(): this is RemotePending<L, A> {
		return false;
	}

	isFailure(): this is RemoteFailure<L, A> {
		return false;
	}

	isSuccess(): this is RemoteSuccess<L, A> {
		return true;
	}

	toOption(): Option<A> {
		return some(this.value);
	}

	toNullable(): A | null {
		return this.value;
	}

	toString(): string {
		return `success(${toString(this.value)})`;
	}

	contains(S: Setoid<A>, a: A): boolean {
		return S.equals(this.value, a);
	}

	exists(p: Predicate<A>): boolean {
		return p(this.value);
	}
}

export class RemotePending<L, A> {
	readonly _tag: 'RemotePending' = 'RemotePending';
	// prettier-ignore
	readonly '_URI': URI;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return fab.fold(initial, pending as any, () => pending, () => pending); //tslint:disable-line no-use-before-declare
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return pending;
	}

	foldL<B>(initial: Lazy<B>, pending: Lazy<B>, failure: Function1<L, B>, success: Function1<A, B>): B {
		return pending();
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: Function1<A, B>): RemoteData<L, B> {
		return this as any;
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	isInitial(): this is RemoteInitial<L, A> {
		return false;
	}

	isPending(): this is RemotePending<L, A> {
		return true;
	}

	isFailure(): this is RemoteFailure<L, A> {
		return false;
	}

	isSuccess(): this is RemoteSuccess<L, A> {
		return false;
	}

	toOption(): Option<A> {
		return none;
	}

	toNullable(): A | null {
		return null;
	}

	toString(): string {
		return 'pending';
	}

	contains(S: Setoid<A>, a: A): boolean {
		return false;
	}

	exists(p: Predicate<A>): boolean {
		return false;
	}
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of `RemoteData` is either an instance of `RemoteInitial`, `RemotePending`, `RemoteFailure` or `RemoteSuccess`
 *
 * A common use of `RemoteData` is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 */
export type RemoteData<L, A> = RemoteInitial<L, A> | RemoteFailure<L, A> | RemoteSuccess<L, A> | RemotePending<L, A>;

//Monad
const of = <L, A>(value: A): RemoteSuccess<L, A> => new RemoteSuccess(value);
const ap = <L, A, B>(fab: RemoteData<L, Function1<A, B>>, fa: RemoteData<L, A>): RemoteData<L, B> => fa.ap(fab);
const map = <L, A, B>(fa: RemoteData<L, A>, f: Function1<A, B>): RemoteData<L, B> => fa.map(f);
const chain = <L, A, B>(fa: RemoteData<L, A>, f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> => fa.chain(f);

//Foldable
const reduce = <L, A, B>(fa: RemoteData<L, A>, b: B, f: Function2<B, A, B>): B => fa.reduce(f, b);

//Traversable
function traverse<F extends URIS2>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT2<F, L, B>>) => Type2<F, L, RemoteData<L, B>>;
function traverse<F extends URIS>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT<F, B>>) => Type<F, RemoteData<L, B>>;
function traverse<F>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT<F, B>>) => HKT<F, RemoteData<L, B>>;
function traverse<F>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData<L, A>, f: Function1<A, HKT<F, B>>) => HKT<F, RemoteData<L, B>> {
	return (ta, f) => {
		if (ta.isSuccess()) {
			return F.map(f(ta.value), of);
		} else {
			return F.of(ta as any);
		}
	};
}

//Alt
const alt = <L, A>(fx: RemoteData<L, A>, fy: RemoteData<L, A>): RemoteData<L, A> => fx.alt(fy);

//Extend
const extend = <L, A, B>(fla: RemoteData<L, A>, f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> => fla.extend(f);

//constructors
export const failure = <L, A>(error: L): RemoteFailure<L, A> => new RemoteFailure(error);
export const success: <L, A>(value: A) => RemoteSuccess<L, A> = of;
export const pending: RemotePending<never, never> = new RemotePending<never, never>();
export const initial: RemoteInitial<never, never> = new RemoteInitial<never, never>();

//Alternative
const zero = <L, A>(): RemoteData<L, A> => initial;

//filters
export const isFailure = <L, A>(data: RemoteData<L, A>): data is RemoteFailure<L, A> => data.isFailure();
export const isSuccess = <L, A>(data: RemoteData<L, A>): data is RemoteSuccess<L, A> => data.isSuccess();
export const isPending = <L, A>(data: RemoteData<L, A>): data is RemotePending<L, A> => data.isPending();
export const isInitial = <L, A>(data: RemoteData<L, A>): data is RemoteInitial<L, A> => data.isInitial();

//Setoid
export const getSetoid = <L, A>(SL: Setoid<L>, SA: Setoid<A>): Setoid<RemoteData<L, A>> => {
	return {
		equals: (x, y) =>
			x.foldL(
				() => y.isInitial(),
				() => y.isPending(),
				xError => y.foldL(constFalse, constFalse, yError => SL.equals(xError, yError), constFalse),
				ax => y.foldL(constFalse, constFalse, constFalse, ay => SA.equals(ax, ay)),
			),
	};
};

//Ord
export const getOrd = <L, A>(OL: Ord<L>, OA: Ord<A>): Ord<RemoteData<L, A>> => {
	return {
		...getSetoid(OL, OA),
		compare: (x, y) =>
			sign(
				x.foldL(
					() => y.fold(0, -1, () => -1, () => -1),
					() => y.fold(1, 0, () => -1, () => -1),
					xError => y.fold(1, 1, yError => OL.compare(xError, yError), () => -1),
					xValue => y.fold(1, 1, () => 1, yValue => OA.compare(xValue, yValue)),
				),
			),
	};
};

//Semigroup
export const getSemigroup = <L, A>(SL: Semigroup<L>, SA: Semigroup<A>): Semigroup<RemoteData<L, A>> => {
	return {
		concat: (x, y) => {
			return x.foldL(
				() => y.fold(y, y, () => y, () => y),
				() => y.fold(x, y, () => y, () => y),

				xError => y.fold(x, x, yError => failure(SL.concat(xError, yError)), () => y),
				xValue => y.fold(x, x, () => x, yValue => success(SA.concat(xValue, yValue))),
			);
		},
	};
};

//Monoid
export const getMonoid = <L, A>(ML: Monoid<L>, MA: Monoid<A>): Monoid<RemoteData<L, A>> => {
	return {
		...getSemigroup(ML, MA),
		empty: initial,
	};
};

export function fromOption<L, A>(option: Option<A>, error: Lazy<L>): RemoteData<L, A> {
	if (isNone(option)) {
		return failure(error());
	} else {
		return success(option.value);
	}
}

export function fromEither<L, A>(either: Either<L, A>): RemoteData<L, A> {
	if (isLeft(either)) {
		return failure(either.value);
	} else {
		return success(either.value);
	}
}

export function fromPredicate<L, A>(
	predicate: Predicate<A>,
	whenFalse: Function1<A, L>,
): Function1<A, RemoteData<L, A>> {
	return a => (predicate(a) ? success(a) : failure(whenFalse(a)));
}

//instance
export const remoteData: Monad2<URI> &
	Foldable2<URI> &
	Traversable2<URI> &
	Alt2<URI> &
	Extend2<URI> &
	Alternative2<URI> = {
	//HKT
	URI,

	//Monad
	of,
	ap,
	map,
	chain,

	//Foldable
	reduce,

	//Traversable
	traverse,

	//Alt
	alt,

	//Alternative
	zero,

	//Extend
	extend,
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
		return of([]);
	}
	return sequence(remoteData, array)(list);
}
