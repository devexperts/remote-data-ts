import { constFalse, Function2, Function1, Lazy, toString, Predicate, identity } from 'fp-ts/lib/function';
import { Monad2 } from 'fp-ts/lib/Monad';
import { Foldable2v2 } from 'fp-ts/lib/Foldable2v';
import { Alt2 } from 'fp-ts/lib/Alt';
import { Extend2 } from 'fp-ts/lib/Extend';
import { Traversable2v2 } from 'fp-ts/lib/Traversable2v';
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor';
import { isNone, none, Option, some } from 'fp-ts/lib/Option';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import { Setoid } from 'fp-ts/lib/Setoid';

import { array } from 'fp-ts/lib/Array';

import { HKT } from 'fp-ts/lib/HKT';
import { Applicative } from 'fp-ts/lib/Applicative';
import { Alternative2 } from 'fp-ts/lib/Alternative';
import { Ord } from 'fp-ts/lib/Ord';
import { sign } from 'fp-ts/lib/Ordering';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Monoidal2 } from 'fp-ts/lib/Monoidal';

export const URI = 'RemoteData';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
	interface URI2HKT2<L, A> {
		RemoteData: RemoteData<L, A>;
	}
}

export type RemoteProgress = {
	loaded: number;
	total: Option<number>;
};
const concatPendings = <L, A>(a: RemotePending<L, A>, b: RemotePending<L, A>): RemoteData<L, A> => {
	if (a.progress.isSome() && b.progress.isSome()) {
		const progressA = a.progress.value;
		const progressB = b.progress.value;
		if (progressA.total.isNone() || progressB.total.isNone()) {
			//tslint:disable no-use-before-declare
			return progress({
				loaded: progressA.loaded + progressB.loaded,
				total: none,
			});
			//tslint:enable no-use-before-declare
		}
		const totalA = progressA.total.value;
		const totalB = progressB.total.value;
		const total = totalA + totalB;
		const loaded = (progressA.loaded * totalA + progressB.loaded * totalB) / (total * total);
		//tslint:disable no-use-before-declare
		return progress({
			loaded,
			total: some(total),
		});
		//tslint:enable no-use-before-declare
	}
	const noA = a.progress.isNone();
	const noB = b.progress.isNone();
	if (noA && !noB) {
		return b;
	}
	if (!noA && noB) {
		return a;
	}
	return pending; //tslint:disable-line no-use-before-declare
};

export class RemoteInitial<L, A> {
	readonly _tag: 'RemoteInitial' = 'RemoteInitial';
	// prettier-ignore
	readonly '_URI': URI;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	/**
	 * `alt` short for alternative, takes another `RemoteData`.
	 * If `this` `RemoteData` is a `RemoteSuccess` type then it will be returned.
	 * If it is a "Left" part then it will return the next `RemoteSuccess` if it exist.
	 * If both are "Left" parts then it will return next "Left" part.
	 *
	 * For example:
	 *
	 * `sucess(1).alt(initial) will return success(1)`
	 *
	 * `pending.alt(success(2) will return success(2)`
	 *
	 * `failure(new Error('err text')).alt(pending) will return pending`
	 */
	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return fy;
	}

	/**
	 * Similar to `alt`, but lazy: it takes a function which returns `RemoteData` object.
	 */
	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return fy();
	}

	/**
	 * `ap`, short for "apply". Takes a function `fab` that is in the context of `RemoteData`,
	 * and applies that function to this `RemoteData`'s value.
	 * If the `RemoteData` calling `ap` is a "Left" part it will return same "Left" part.
	 * If you pass a "Left" part to `ap` as an argument, it will return same "Left" part regardless on `RemoteData` which calls `ap`.
	 *
	 * For example:
	 *
	 * `success(1).ap(success(x => x + 1)) will return success(2)`.
	 *
	 * `success(1).ap(initial) will return initial`.
	 *
	 * `pending.ap(success(x => x+1)) will return pending`.
	 *
	 * `failure(new Error('err text')).ap(initial) will return failure.`
	 */
	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return fab.isFailure() ? ((fab as unknown) as RemoteFailure<L, B>) : initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Takes a function `f` and returns a result of applying it to `RemoteData` value.
	 * It's a bit like a `map`, but `f` should returns `RemoteData<T>` instead of `T` in `map`.
	 * If this `RemoteData` is "Left" part, then it will return the same "Left" part.
	 *
	 * For example:
	 *
	 * `success(1).chain(x => success(x + 1)) will return success(2)`
	 *
	 * `success(2).chain(() => pending) will return pending`
	 *
	 * `initial.chain(x => success(x)) will return initial`
	 */
	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	bimap<V, B>(f: (l: L) => V, g: (a: A) => B): RemoteData<V, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Takes a function `f` and returns a result of applying it to `RemoteData`.
	 * It's a bit like a `chain`, but `f` should takes `RemoteData<T>` instead of returns it, and it should return T instead of takes it.
	 */
	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Needed for "unwrap" value from `RemoteData` "container".
	 * It applies a function to each case in the data structure.
	 *
	 * For example:
	 *
	 * `const foldInitial = 'it's initial'
	 * `const foldPending = 'it's pending'
	 * `const foldFailure = (err) => 'it's failure'
	 * `const foldSuccess = (data) => data + 1'
	 *
	 * `initial.fold(foldInitial, foldPending, foldFailure, foldSuccess) will return 'it's initial'`
	 *
	 * `pending.fold(foldInitial, foldPending, foldFailure, foldSuccess) will return 'it's pending'`
	 *
	 * `failure(new Error('error text')).fold(foldInitial, foldPending, foldFailure, foldSuccess) will return 'it's failure'`
	 *
	 * `success(21).fold(foldInitial, foldPending, foldFailure, foldSuccess) will return 22`
	 */
	fold<B>(onInitial: B, onPending: B, onFailure: Function1<L, B>, onSuccess: Function1<A, B>): B {
		return onInitial;
	}

	/**
	 * Same as `fold` but lazy: in `initial` and `pending` state it takes a function instead of value.
	 *
	 * For example:
	 *
	 * `const foldInitial = () => 'it's initial'
	 * `const foldPending = () => 'it's pending'
	 *
	 * rest of example is similar to `fold`
	 */
	foldL<B>(
		onInitial: Lazy<B>,
		onPending: Function1<Option<RemoteProgress>, B>,
		onFailure: Function1<L, B>,
		onSuccess: Function1<A, B>,
	): B {
		return onInitial();
	}

	/**
	 * Same as `getOrElse` but lazy: it pass as an argument a function which returns a default value.
	 *
	 * For example:
	 *
	 * `some(1).getOrElse(() => 999) will return 1`
	 *
	 * `initial.getOrElseValue(() => 999) will return 999`
	 */
	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	/**
	 * Takes a function `f`.
	 * If it maps on `RemoteSuccess` then it will apply a function to `RemoteData`'s value
	 * If it maps on "Left" part then it will return the same "Left" part.
	 *
	 * For example:
	 *
	 * `success(1).map(x => x + 99) will return success(100)`
	 *
	 * `initial.map(x => x + 99) will return initial`
	 *
	 * `pending.map(x => x + 99) will return pending`
	 *
	 * `failure(new Error('error text')).map(x => x + 99) will return failure(new Error('error text')`
	 */
	map<B>(f: Function1<A, B>): RemoteData<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Similar to `map`, but it only map a `RemoteFailure` ("Left" part where we have some data, so we can map it).
	 *
	 * For example:
	 *
	 * `success(1).map(x => 'new error text') will return success(1)`
	 *
	 * `initial.map(x => 'new error text') will return initial`
	 *
	 * `failure(new Error('error text')).map(x => 'new error text') will return failure(new Error('new error text'))`
	 */
	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Takes a default value as an argument.
	 * If this `RemoteData` is "Left" part it will return default value.
	 * If this `RemoteData` is `RemoteSuccess` it will return it's value ("wrapped" value, not default value)
	 *
	 * Note: Default value should be the same type as `RemoteData` (internal) value, if you want to pass different type as default, use `fold` or `foldL`.
	 *
	 * For example:
	 *
	 * `some(1).getOrElse(999) will return 1`
	 *
	 * `initial.getOrElseValue(999) will return 999`
	 *
	 */
	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	/**
	 * Returns true only if `RemoteData` is `RemoteInitial`.
	 *
	 */
	isInitial(): this is RemoteInitial<L, A> {
		return true;
	}

	/**
	 * Returns true only if `RemoteData` is `RemotePending`.
	 *
	 */
	isPending(): this is RemotePending<L, A> {
		return false;
	}

	/**
	 * Returns true only if `RemoteData` is `RemoteFailure`.
	 *
	 */
	isFailure(): this is RemoteFailure<L, A> {
		return false;
	}

	/**
	 * Returns true only if `RemoteData` is `RemoteSuccess`.
	 *
	 */
	isSuccess(): this is RemoteSuccess<L, A> {
		return false;
	}

	/**
	 * Convert `RemoteData` to `Option`.
	 * "Left" part will be converted to `None`.
	 * `RemoteSuccess` will be converted to `Some`.
	 *
	 * For example:
	 *
	 * `success(2).toOption() will return some(2)`
	 *
	 * `initial.toOption() will return none`
	 *
	 * `pending.toOption() will return none`
	 *
	 * `failure(new Error('error text')).toOption() will return none`
	 */
	toOption(): Option<A> {
		return none;
	}

	/**
	 * Convert `RemoteData` to `Either`.
	 * "Left" part will be converted to `Left<L>`.
	 * Since `RemoteInitial` and `RemotePending` do not have `L` values,
	 * you must provide a value of type `L` that will be used to construct
	 * the `Left<L>` for those two cases.
	 * `RemoteSuccess` will be converted to `Right<R>`.
	 *
	 * For example:
	 *
	 * `const iError = new Error('Data not fetched')`
	 * `const pError = new Error('Data is fetching')`
	 *
	 * `success(2).toEither(iError, pError) will return right(2)`
	 *
	 * `initial.toEither(iError, pError) will return right(Error('Data not fetched'))`
	 *
	 * `pending.toEither(iError, pError) will return right(Error('Data is fetching'))`
	 *
	 * `failure(new Error('error text')).toEither(iError, pError) will return right(Error('error text'))`
	 */
	toEither(onInitial: L, onPending: L): Either<L, A> {
		return left(onInitial);
	}

	/**
	 * Like `toEither`, but lazy: it takes functions that return an `L` value
	 * as arguments instead of an `L` value.
	 *
	 * For example:
	 *
	 * `const iError = () => new Error('Data not fetched')`
	 * `const pError = () => new Error('Data is fetching')`
	 *
	 * `initial.toEither(iError, pError) will return right(Error('Data not fetched'))`
	 *
	 * `pending.toEither(iError, pError) will return right(Error('Data is fetching'))`
	 */
	toEitherL(onInitial: Lazy<L>, onPending: Lazy<L>): Either<L, A> {
		return left(onInitial());
	}

	/**
	 * One more way to fold (unwrap) value from `RemoteData`.
	 * "Left" part will return `null`.
	 * `RemoteSuccess` will return value.
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
	toNullable(): A | null {
		return null;
	}

	/**
	 * Returns string representation of `RemoteData`.
	 */
	toString(): string {
		return 'initial';
	}

	/**
	 * Compare values and returns `true` if they are identical, otherwise returns `false`.
	 * "Left" part will return `false`.
	 * `RemoteSuccess` will call `Setoid`'s `equals` method.
	 *
	 * If you want to compare `RemoteData`'s values better use `getSetoid` or `getOrd` helpers.
	 *
	 */
	contains(S: Setoid<A>, a: A): boolean {
		return false;
	}

	/**
	 * Takes a predicate and apply it to `RemoteSuccess` value.
	 * "Left" part will return `false`.
	 */
	exists(p: Predicate<A>): boolean {
		return false;
	}

	/**
	 * Maps this RemoteFailure error into RemoteSuccess if passed function f return {@link Some} value, otherwise returns self
	 */
	recover(f: (error: L) => Option<A>): RemoteData<L, A> {
		return this;
	}

	/**
	 * Recovers this RemoteFailure also mapping RemoteSuccess case
	 * @see {@link recover}
	 */
	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
		return (this as unknown) as RemoteInitial<L, B>;
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
		//tslint:disable-next-line no-use-before-declare
		return fab.isFailure() ? ((fab as unknown) as RemoteFailure<L, B>) : ((this as unknown) as RemoteFailure<L, B>);
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return (this as unknown) as RemoteFailure<L, B>;
	}

	bimap<V, B>(f: (l: L) => V, g: (a: A) => B): RemoteData<V, B> {
		return failure(f(this.error)); //tslint:disable-line no-use-before-declare
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return (this as unknown) as RemoteFailure<L, B>;
	}

	fold<B>(onInitial: B, onPending: B, onFailure: Function1<L, B>, onSuccess: Function1<A, B>): B {
		return onFailure(this.error);
	}

	foldL<B>(
		onInitial: Lazy<B>,
		onPending: Function1<Option<RemoteProgress>, B>,
		onFailure: Function1<L, B>,
		onSuccess: Function1<A, B>,
	): B {
		return onFailure(this.error);
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData<L, B> {
		return (this as unknown) as RemoteFailure<L, B>;
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

	toEither(onInitial: L, onPending: L): Either<L, A> {
		return left(this.error);
	}

	toEitherL(onInitial: Lazy<L>, onPending: Lazy<L>): Either<L, A> {
		return left(this.error);
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

	recover(f: (error: L) => Option<A>): RemoteData<L, A> {
		return this.recoverMap(f, identity);
	}

	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
		return f(this.error).fold(
			(this as unknown) as RemoteData<L, B>,
			(success as unknown) as (a: B) => RemoteData<L, B>, //tslint:disable-line no-use-before-declare
		);
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
		return fab.fold(
			initial, //tslint:disable-line no-use-before-declare
			(fab as unknown) as RemoteData<L, B>,
			() => (fab as unknown) as RemoteData<L, B>,
			value => this.map(value),
		);
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return f(this.value);
	}

	bimap<V, B>(f: (l: L) => V, g: (a: A) => B): RemoteData<V, B> {
		return success(g(this.value)); //tslint:disable-line no-use-before-declare
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return of(f(this)); //tslint:disable-line no-use-before-declare
	}

	fold<B>(onInitial: B, onPending: B, onFailure: Function1<L, B>, onSuccess: Function1<A, B>): B {
		return onSuccess(this.value);
	}

	foldL<B>(
		onInitial: Lazy<B>,
		onPending: Function1<Option<RemoteProgress>, B>,
		onFailure: Function1<L, B>,
		onSuccess: Function1<A, B>,
	): B {
		return onSuccess(this.value);
	}

	getOrElseL(f: Lazy<A>): A {
		return this.value;
	}

	map<B>(f: Function1<A, B>): RemoteData<L, B> {
		return of(f(this.value)); //tslint:disable-line no-use-before-declare
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return (this as unknown) as RemoteSuccess<M, A>;
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

	toEither(onInitial: L, onPending: L): Either<L, A> {
		return right(this.value);
	}

	toEitherL(onInitial: Lazy<L>, onPending: Lazy<L>): Either<L, A> {
		return right(this.value);
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

	recover(f: (error: L) => Option<A>): RemoteData<L, A> {
		return this;
	}

	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
		return this.map(g);
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

	constructor(readonly progress: Option<RemoteProgress> = none) {}

	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return fab.fold(
			initial, //tslint:disable-line no-use-before-declare
			fab.isPending()
				? ((concatPendings(this, (fab as unknown) as RemotePending<L, A>) as unknown) as RemotePending<L, B>)
				: ((this as unknown) as RemoteData<L, B>),
			() => (fab as unknown) as RemoteFailure<L, B>,
			() => (this as unknown) as RemoteSuccess<L, B>,
		);
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	bimap<V, B>(f: (l: L) => V, g: (a: A) => B): RemoteData<V, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	fold<B>(onInitial: B, onPending: B, onFailure: Function1<L, B>, onSuccess: Function1<A, B>): B {
		return onPending;
	}

	foldL<B>(
		onInitial: Lazy<B>,
		onPending: Function1<Option<RemoteProgress>, B>,
		onFailure: Function1<L, B>,
		onSuccess: Function1<A, B>,
	): B {
		return onPending(this.progress);
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: Function1<A, B>): RemoteData<L, B> {
		return (this as unknown) as RemotePending<L, B>;
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

	toEither(onInitial: L, onPending: L): Either<L, A> {
		return left(onPending);
	}

	toEitherL(onInitial: Lazy<L>, onPending: Lazy<L>): Either<L, A> {
		return left(onPending());
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

	recover(f: (error: L) => Option<A>): RemoteData<L, A> {
		return this;
	}

	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData<L, B> {
		return (this as unknown) as RemotePending<L, B>;
	}
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of `RemoteData` is either an instance of `RemoteInitial`, `RemotePending`, `RemoteFailure` or `RemoteSuccess`
 *
 * A common use of `RemoteData` is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * Note: `RemoteInitial`, `RemotePending` and `RemoteFailure` are commonly called "Left" part in jsDoc.
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

//Foldable2v
const reduce = <L, A, B>(fa: RemoteData<L, A>, b: B, f: Function2<B, A, B>): B => fa.reduce(f, b);
const foldMap = <M>(M: Monoid<M>) => <L, A>(fa: RemoteData<L, A>, f: (a: A) => M): M =>
	fa.isSuccess() ? f(fa.value) : M.empty;
const foldr = <L, A, B>(fa: RemoteData<L, A>, b: B, f: (a: A, b: B) => B): B => (fa.isSuccess() ? f(fa.value, b) : b);

//Traversable2v
const traverse = <F>(F: Applicative<F>) => <L, A, B>(
	ta: RemoteData<L, A>,
	f: (a: A) => HKT<F, B>,
): HKT<F, RemoteData<L, B>> => {
	if (ta.isSuccess()) {
		return F.map<B, RemoteData<L, B>>(f(ta.value), of);
	} else if (ta.isFailure()) {
		return F.of((ta as unknown) as RemoteFailure<L, B>);
	} else if (ta.isInitial()) {
		return F.of((ta as unknown) as RemoteInitial<L, B>);
	} else {
		return F.of((ta as unknown) as RemotePending<L, B>);
	}
};
const sequence = <F>(F: Applicative<F>) => <L, A>(ta: RemoteData<L, HKT<F, A>>): HKT<F, RemoteData<L, A>> => {
	if (ta.isSuccess()) {
		return F.map<A, RemoteData<L, A>>(ta.value, of);
	} else if (ta.isFailure()) {
		return F.of((ta as unknown) as RemoteFailure<L, A>);
	} else if (ta.isInitial()) {
		return F.of((ta as unknown) as RemoteInitial<L, A>);
	} else {
		return F.of((ta as unknown) as RemotePending<L, A>);
	}
};

//Bifunctor
const bimap = <L, V, A, B>(fla: RemoteData<L, A>, f: (u: L) => V, g: (a: A) => B): RemoteData<V, B> => {
	return fla.bimap(f, g);
};

//Alt
const alt = <L, A>(fx: RemoteData<L, A>, fy: RemoteData<L, A>): RemoteData<L, A> => fx.alt(fy);

//Extend
const extend = <L, A, B>(fla: RemoteData<L, A>, f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> => fla.extend(f);

//constructors
export const failure = <L, A>(error: L): RemoteData<L, A> => new RemoteFailure(error);
export const success: <L, A>(value: A) => RemoteData<L, A> = of;
export const pending: RemoteData<never, never> = new RemotePending<never, never>();
export const progress = <L, A>(progress: RemoteProgress): RemoteData<L, A> => new RemotePending(some(progress));
export const initial: RemoteData<never, never> = new RemoteInitial<never, never>();

//Alternative
const zero = <L, A>(): RemoteData<L, A> => initial;

//filters
export const isFailure = <L, A>(data: RemoteData<L, A>): data is RemoteFailure<L, A> => data.isFailure();
export const isSuccess = <L, A>(data: RemoteData<L, A>): data is RemoteSuccess<L, A> => data.isSuccess();
export const isPending = <L, A>(data: RemoteData<L, A>): data is RemotePending<L, A> => data.isPending();
export const isInitial = <L, A>(data: RemoteData<L, A>): data is RemoteInitial<L, A> => data.isInitial();

//Monoidal
const unit = <L, A>(): RemoteData<L, A> => initial;
const mult = <L, A, B>(fa: RemoteData<L, A>, fb: RemoteData<L, B>): RemoteData<L, [A, B]> => combine(fa, fb);

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
				() =>
					y.foldL(
						() => x,
						() => concatPendings(x as RemotePending<L, A>, y as RemotePending<L, A>),
						() => y,
						() => y,
					),

				xError => y.fold(x, x, yError => failure(SL.concat(xError, yError)), () => y),
				xValue => y.fold(x, x, () => x, yValue => success(SA.concat(xValue, yValue))),
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

export function fromProgressEvent<L, A>(event: ProgressEvent): RemoteData<L, A> {
	return progress({
		loaded: event.loaded,
		total: event.lengthComputable ? some(event.total) : none,
	});
}

//instance
export const remoteData: Monad2<URI> &
	Foldable2v2<URI> &
	Traversable2v2<URI> &
	Bifunctor2<URI> &
	Alt2<URI> &
	Extend2<URI> &
	Alternative2<URI> &
	Monoidal2<URI> = {
	//HKT
	URI,

	//Monad
	of,
	ap,
	map,
	chain,

	//Foldable2v
	reduce,
	foldMap,
	foldr,

	//Traversable2v
	traverse,
	sequence,

	//Bifunctor
	bimap,

	//Alt
	alt,

	//Alternative
	zero,

	//Extend
	extend,

	//Monoidal
	unit,
	mult,
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
	return array.sequence(remoteData)(list);
}
