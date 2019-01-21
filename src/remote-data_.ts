import { constFalse, Function2, Function1, Lazy, toString, Predicate, identity } from 'fp-ts/lib/function';
import { Monad2 } from 'fp-ts/lib/Monad';
import { Foldable2 } from 'fp-ts/lib/Foldable';
import { Alt2 } from 'fp-ts/lib/Alt';
import { Extend2 } from 'fp-ts/lib/Extend';
import { sequence, Traversable2 } from 'fp-ts/lib/Traversable';
import { isNone, none, Option, some } from 'fp-ts/lib/Option';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import { Setoid } from 'fp-ts/lib/Setoid';

import { array } from 'fp-ts/lib/Array';

import { HKT, HKT2, Type, Type2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Applicative } from 'fp-ts/lib/Applicative';
import { Alternative2 } from 'fp-ts/lib/Alternative';
import { Ord } from 'fp-ts/lib/Ord';
import { sign } from 'fp-ts/lib/Ordering';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Monoidal2 } from 'fp-ts/lib/Monoidal';

export const URI_ = 'RemoteData_';
export type URI_ = typeof URI_;
declare module 'fp-ts/lib/HKT' {
	interface URI2HKT2<L, A> {
		RemoteData_: RemoteData_<L, A>;
	}
}

export type RemoteProgress_ = {
	loaded: number;
	total: Option<number>;
};
const concatPendings = <L, A>(a: RemotePending_<L, A>, b: RemotePending_<L, A>): RemoteData_<L, A> => {
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

//tslint:disable-next-line class-name
export class RemoteInitial_<L, A> {
	readonly _tag: 'RemoteInitial_' = 'RemoteInitial_';
	// prettier-ignore
	readonly '_URI': URI_;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	/**
	 * `alt` short for alternative, takes another `RemoteData_`.
	 * If `this` `RemoteData_` is a `RemoteSuccess_` type then it will be returned.
	 * If it is a "Left" part then it will return the next `RemoteSuccess_` if it exist.
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
	alt(fy: RemoteData_<L, A>): RemoteData_<L, A> {
		return fy;
	}

	/**
	 * Similar to `alt`, but lazy: it takes a function which returns `RemoteData_` object.
	 */
	altL(fy: Lazy<RemoteData_<L, A>>): RemoteData_<L, A> {
		return fy();
	}

	/**
	 * `ap`, short for "apply". Takes a function `fab` that is in the context of `RemoteData_`,
	 * and applies that function to this `RemoteData_`'s value.
	 * If the `RemoteData_` calling `ap` is "Left" part it will return same "Left" part.
	 * If you pass "Left" part to `ap` as an argument, it will return same "Left" part regardless on `RemoteData_` which calls `ap`.
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
	ap<B>(fab: RemoteData_<L, Function1<A, B>>): RemoteData_<L, B> {
		return fab.isFailure() ? (fab as any) : initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Takes a function `f` and returns a result of applying it to `RemoteData_` value.
	 * It's a bit like a `map`, but `f` should returns `RemoteData_<T>` instead of `T` in `map`.
	 * If this `RemoteData_` is "Left" part, then it will return the same "Left" part.
	 *
	 * For example:
	 *
	 * `success(1).chain(x => success(x + 1)) will return success(2)`
	 *
	 * `success(2).chain(() => pending) will return pending`
	 *
	 * `initial.chain(x => success(x)) will return initial`
	 */
	chain<B>(f: Function1<A, RemoteData_<L, B>>): RemoteData_<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Takes a function `f` and returns a result of applying it to `RemoteData_`.
	 * It's a bit like a `chain`, but `f` should takes `RemoteData_<T>` instead of returns it, and it should return T instead of takes it.
	 */
	extend<B>(f: Function1<RemoteData_<L, A>, B>): RemoteData_<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Needed for "unwrap" value from `RemoteData_` "container".
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
	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return initial;
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
		initial: Lazy<B>,
		pending: Function1<Option<RemoteProgress_>, B>,
		failure: Function1<L, B>,
		success: Function1<A, B>,
	): B {
		return initial();
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
	 * If it maps on `RemoteSuccess_` then it will apply a function to `RemoteData_`'s value
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
	map<B>(f: Function1<A, B>): RemoteData_<L, B> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Similar to `map`, but it only map a `RemoteFailure_` ("Left" part where we have some data, so we can map it).
	 *
	 * For example:
	 *
	 * `success(1).map(x => 'new error text') will return success(1)`
	 *
	 * `initial.map(x => 'new error text') will return initial`
	 *
	 * `failure(new Error('error text')).map(x => 'new error text') will return failure(new Error('new error text'))`
	 */
	mapLeft<M>(f: Function1<L, M>): RemoteData_<M, A> {
		return initial; //tslint:disable-line no-use-before-declare
	}

	/**
	 * Takes a default value as an argument.
	 * If this `RemoteData_` is "Left" part it will return default value.
	 * If this `RemoteData_` is `RemoteSuccess_` it will return it's value ("wrapped" value, not default value)
	 *
	 * Note: Default value should be the same type as `RemoteData_` (internal) value, if you want to pass different type as default, use `fold` or `foldL`.
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
	 * Returns true only if `RemoteData_` is `RemoteInitial_`.
	 *
	 */
	isInitial(): this is RemoteInitial_<L, A> {
		return true;
	}

	/**
	 * Returns true only if `RemoteData_` is `RemotePending_`.
	 *
	 */
	isPending(): this is RemotePending_<L, A> {
		return false;
	}

	/**
	 * Returns true only if `RemoteData_` is `RemoteFailure_`.
	 *
	 */
	isFailure(): this is RemoteFailure_<L, A> {
		return false;
	}

	/**
	 * Returns true only if `RemoteData_` is `RemoteSuccess_`.
	 *
	 */
	isSuccess(): this is RemoteSuccess_<L, A> {
		return false;
	}

	/**
	 * Convert `RemoteData_` to `Option`.
	 * "Left" part will be converted to `None`.
	 * `RemoteSuccess_` will be converted to `Some`.
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
	 * Convert `RemoteData_` to `Either`.
	 * "Left" part will be converted to `Left<L>`.
	 * Since `RemoteInitial_` and `RemotePending_` do not have `L` values,
	 * you must provide a value of type `L` that will be used to construct
	 * the `Left<L>` for those two cases.
	 * `RemoteSuccess_` will be converted to `Right<R>`.
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
	toEither(initial: L, pending: L): Either<L, A> {
		return left(initial);
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
	toEitherL(initial: Lazy<L>, pending: Lazy<L>): Either<L, A> {
		return left(initial());
	}

	/**
	 * One more way to fold (unwrap) value from `RemoteData_`.
	 * "Left" part will return `null`.
	 * `RemoteSuccess_` will return value.
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
	 * Returns string representation of `RemoteData_`.
	 */
	toString(): string {
		return 'initial';
	}

	/**
	 * Compare values and returns `true` if they are identical, otherwise returns `false`.
	 * "Left" part will return `false`.
	 * `RemoteSuccess_` will call `Setoid`'s `equals` method.
	 *
	 * If you want to compare `RemoteData_`'s values better use `getSetoid` or `getOrd` helpers.
	 *
	 */
	contains(S: Setoid<A>, a: A): boolean {
		return false;
	}

	/**
	 * Takes a predicate and apply it to `RemoteSuccess_` value.
	 * "Left" part will return `false`.
	 */
	exists(p: Predicate<A>): boolean {
		return false;
	}

	/**
	 * Maps this RemoteFailure error into RemoteSuccess if passed function f return {@link Some} value, otherwise returns self
	 */
	recover(f: (error: L) => Option<A>): RemoteData_<L, A> {
		return this;
	}

	/**
	 * Recovers this RemoteFailure also mapping RemoteSuccess case
	 * @see {@link recover}
	 */
	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData_<L, B> {
		return this as any;
	}
}

//tslint:disable-next-line class-name
export class RemoteFailure_<L, A> {
	readonly _tag: 'RemoteFailure_' = 'RemoteFailure_';
	// prettier-ignore
	readonly '_URI': URI_;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	constructor(readonly error: L) {}

	alt(fy: RemoteData_<L, A>): RemoteData_<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData_<L, A>>): RemoteData_<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData_<L, Function1<A, B>>): RemoteData_<L, B> {
		return fab.isFailure() ? (fab as any) : (this as any); //tslint:disable-line no-use-before-declare
	}

	chain<B>(f: Function1<A, RemoteData_<L, B>>): RemoteData_<L, B> {
		return this as any;
	}

	extend<B>(f: Function1<RemoteData_<L, A>, B>): RemoteData_<L, B> {
		return this as any;
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return failure(this.error);
	}

	foldL<B>(
		initial: Lazy<B>,
		pending: Function1<Option<RemoteProgress_>, B>,
		failure: Function1<L, B>,
		success: Function1<A, B>,
	): B {
		return failure(this.error);
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData_<L, B> {
		return this as any;
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData_<M, A> {
		return failure(f(this.error)); //tslint:disable-line no-use-before-declare
	}

	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	isInitial(): this is RemoteInitial_<L, A> {
		return false;
	}

	isPending(): this is RemotePending_<L, A> {
		return false;
	}

	isFailure(): this is RemoteFailure_<L, A> {
		return true;
	}

	isSuccess(): this is RemoteSuccess_<L, A> {
		return false;
	}

	toOption(): Option<A> {
		return none;
	}

	toEither(initial: L, pending: L): Either<L, A> {
		return left(this.error);
	}

	toEitherL(initial: Lazy<L>, pending: Lazy<L>): Either<L, A> {
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

	recover(f: (error: L) => Option<A>): RemoteData_<L, A> {
		return this.recoverMap(f, identity);
	}

	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData_<L, B> {
		return f(this.error).fold(this as any, success); //tslint:disable-line no-use-before-declare
	}
}

//tslint:disable-next-line class-name
export class RemoteSuccess_<L, A> {
	readonly _tag: 'RemoteSuccess_' = 'RemoteSuccess_';
	// prettier-ignore
	readonly '_URI': URI_;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	constructor(readonly value: A) {}

	alt(fy: RemoteData_<L, A>): RemoteData_<L, A> {
		return this;
	}

	altL(fy: Lazy<RemoteData_<L, A>>): RemoteData_<L, A> {
		return this;
	}

	ap<B>(fab: RemoteData_<L, Function1<A, B>>): RemoteData_<L, B> {
		return fab.fold(initial, fab, () => fab as any, value => this.map(value)); //tslint:disable-line no-use-before-declare
	}

	chain<B>(f: Function1<A, RemoteData_<L, B>>): RemoteData_<L, B> {
		return f(this.value);
	}

	extend<B>(f: Function1<RemoteData_<L, A>, B>): RemoteData_<L, B> {
		return of(f(this)); //tslint:disable-line no-use-before-declare
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return success(this.value);
	}

	foldL<B>(
		initial: Lazy<B>,
		pending: Function1<Option<RemoteProgress_>, B>,
		failure: Function1<L, B>,
		success: Function1<A, B>,
	): B {
		return success(this.value);
	}

	getOrElseL(f: Lazy<A>): A {
		return this.value;
	}

	map<B>(f: Function1<A, B>): RemoteData_<L, B> {
		return of(f(this.value)); //tslint:disable-line no-use-before-declare
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData_<M, A> {
		return this as any;
	}

	getOrElse(value: A): A {
		return this.value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return f(b, this.value);
	}

	isInitial(): this is RemoteInitial_<L, A> {
		return false;
	}

	isPending(): this is RemotePending_<L, A> {
		return false;
	}

	isFailure(): this is RemoteFailure_<L, A> {
		return false;
	}

	isSuccess(): this is RemoteSuccess_<L, A> {
		return true;
	}

	toOption(): Option<A> {
		return some(this.value);
	}

	toEither(initial: L, pending: L): Either<L, A> {
		return right(this.value);
	}

	toEitherL(initial: Lazy<L>, pending: Lazy<L>): Either<L, A> {
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

	recover(f: (error: L) => Option<A>): RemoteData_<L, A> {
		return this;
	}

	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData_<L, B> {
		return this.map(g);
	}
}

//tslint:disable-next-line class-name
export class RemotePending_<L, A> {
	readonly _tag: 'RemotePending_' = 'RemotePending_';
	// prettier-ignore
	readonly '_URI': URI_;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	constructor(readonly progress: Option<RemoteProgress_> = none) {}

	alt(fy: RemoteData_<L, A>): RemoteData_<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData_<L, A>>): RemoteData_<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData_<L, Function1<A, B>>): RemoteData_<L, B> {
		return fab.fold(
			initial, //tslint:disable-line no-use-before-declare
			fab.isPending() ? (concatPendings(this, fab as any) as any) : this,
			() => fab,
			() => this,
		);
	}

	chain<B>(f: Function1<A, RemoteData_<L, B>>): RemoteData_<L, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	extend<B>(f: Function1<RemoteData_<L, A>, B>): RemoteData_<L, B> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, success: Function1<A, B>): B {
		return pending;
	}

	foldL<B>(
		initial: Lazy<B>,
		pending: Function1<Option<RemoteProgress_>, B>,
		failure: Function1<L, B>,
		success: Function1<A, B>,
	): B {
		return pending(this.progress);
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: Function1<A, B>): RemoteData_<L, B> {
		return this as any;
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData_<M, A> {
		return pending; //tslint:disable-line no-use-before-declare
	}

	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	isInitial(): this is RemoteInitial_<L, A> {
		return false;
	}

	isPending(): this is RemotePending_<L, A> {
		return true;
	}

	isFailure(): this is RemoteFailure_<L, A> {
		return false;
	}

	isSuccess(): this is RemoteSuccess_<L, A> {
		return false;
	}

	toOption(): Option<A> {
		return none;
	}

	toEither(initial: L, pending: L): Either<L, A> {
		return left(pending);
	}

	toEitherL(initial: Lazy<L>, pending: Lazy<L>): Either<L, A> {
		return left(pending());
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

	recover(f: (error: L) => Option<A>): RemoteData_<L, A> {
		return this;
	}

	recoverMap<B>(f: (error: L) => Option<B>, g: (value: A) => B): RemoteData_<L, B> {
		return this as any;
	}
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of `RemoteData_` is either an instance of `RemoteInitial_`, `RemotePending_`, `RemoteFailure_` or `RemoteSuccess_`
 *
 * A common use of `RemoteData_` is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * Note: `RemoteInitial_`, `RemotePending_` and `RemoteFailure_` are commonly called "Left" part in jsDoc.
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 */
export type RemoteData_<L, A> =
	| RemoteInitial_<L, A>
	| RemoteFailure_<L, A>
	| RemoteSuccess_<L, A>
	| RemotePending_<L, A>;

//Monad
const of = <L, A>(value: A): RemoteSuccess_<L, A> => new RemoteSuccess_(value);
const ap = <L, A, B>(fab: RemoteData_<L, Function1<A, B>>, fa: RemoteData_<L, A>): RemoteData_<L, B> => fa.ap(fab);
const map = <L, A, B>(fa: RemoteData_<L, A>, f: Function1<A, B>): RemoteData_<L, B> => fa.map(f);
const chain = <L, A, B>(fa: RemoteData_<L, A>, f: Function1<A, RemoteData_<L, B>>): RemoteData_<L, B> => fa.chain(f);

//Foldable
const reduce = <L, A, B>(fa: RemoteData_<L, A>, b: B, f: Function2<B, A, B>): B => fa.reduce(f, b);

//Traversable
function traverse<F extends URIS2>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData_<L, A>, f: Function1<A, HKT2<F, L, B>>) => Type2<F, L, RemoteData_<L, B>>;
function traverse<F extends URIS>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData_<L, A>, f: Function1<A, HKT<F, B>>) => Type<F, RemoteData_<L, B>>;
function traverse<F>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData_<L, A>, f: Function1<A, HKT<F, B>>) => HKT<F, RemoteData_<L, B>>;
function traverse<F>(
	F: Applicative<F>,
): <L, A, B>(ta: RemoteData_<L, A>, f: Function1<A, HKT<F, B>>) => HKT<F, RemoteData_<L, B>> {
	return (ta, f) => {
		if (ta.isSuccess()) {
			return F.map(f(ta.value), of);
		} else {
			return F.of(ta as any);
		}
	};
}

//Alt
const alt = <L, A>(fx: RemoteData_<L, A>, fy: RemoteData_<L, A>): RemoteData_<L, A> => fx.alt(fy);

//Extend
const extend = <L, A, B>(fla: RemoteData_<L, A>, f: Function1<RemoteData_<L, A>, B>): RemoteData_<L, B> =>
	fla.extend(f);

//constructors
export const failure = <L, A>(error: L): RemoteData_<L, A> => new RemoteFailure_(error);
export const success: <L, A>(value: A) => RemoteData_<L, A> = of;
export const pending: RemoteData_<never, never> = new RemotePending_<never, never>();
export const progress = <L, A>(progress: RemoteProgress_): RemoteData_<L, A> => new RemotePending_(some(progress));
export const initial: RemoteData_<never, never> = new RemoteInitial_<never, never>();

//Alternative
const zero = <L, A>(): RemoteData_<L, A> => initial;

//filters
export const isFailure = <L, A>(data: RemoteData_<L, A>): data is RemoteFailure_<L, A> => data.isFailure();
export const isSuccess = <L, A>(data: RemoteData_<L, A>): data is RemoteSuccess_<L, A> => data.isSuccess();
export const isPending = <L, A>(data: RemoteData_<L, A>): data is RemotePending_<L, A> => data.isPending();
export const isInitial = <L, A>(data: RemoteData_<L, A>): data is RemoteInitial_<L, A> => data.isInitial();

//Monoidal
const unit = <L, A>(): RemoteData_<L, A> => initial;
const mult = <L, A, B>(fa: RemoteData_<L, A>, fb: RemoteData_<L, B>): RemoteData_<L, [A, B]> => combine(fa, fb);

//Setoid
export const getSetoid = <L, A>(SL: Setoid<L>, SA: Setoid<A>): Setoid<RemoteData_<L, A>> => {
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
export const getOrd = <L, A>(OL: Ord<L>, OA: Ord<A>): Ord<RemoteData_<L, A>> => {
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
export const getSemigroup = <L, A>(SL: Semigroup<L>, SA: Semigroup<A>): Semigroup<RemoteData_<L, A>> => {
	return {
		concat: (x, y) => {
			return x.foldL(
				() => y.fold(y, y, () => y, () => y),
				() => y.foldL(() => x, () => concatPendings(x as any, y as any), () => y, () => y),

				xError => y.fold(x, x, yError => failure(SL.concat(xError, yError)), () => y),
				xValue => y.fold(x, x, () => x, yValue => success(SA.concat(xValue, yValue))),
			);
		},
	};
};

//Monoid
export const getMonoid = <L, A>(SL: Semigroup<L>, SA: Semigroup<A>): Monoid<RemoteData_<L, A>> => {
	return {
		...getSemigroup(SL, SA),
		empty: initial,
	};
};

export function fromOption<L, A>(option: Option<A>, error: Lazy<L>): RemoteData_<L, A> {
	if (isNone(option)) {
		return failure(error());
	} else {
		return success(option.value);
	}
}

export function fromEither<L, A>(either: Either<L, A>): RemoteData_<L, A> {
	if (isLeft(either)) {
		return failure(either.value);
	} else {
		return success(either.value);
	}
}

export function fromPredicate<L, A>(
	predicate: Predicate<A>,
	whenFalse: Function1<A, L>,
): Function1<A, RemoteData_<L, A>> {
	return a => (predicate(a) ? success(a) : failure(whenFalse(a)));
}

export function fromProgressEvent<L, A>(event: ProgressEvent): RemoteData_<L, A> {
	return progress({
		loaded: event.loaded,
		total: event.lengthComputable ? some(event.total) : none,
	});
}

//instance
export const remoteData: Monad2<URI_> &
	Foldable2<URI_> &
	Traversable2<URI_> &
	Alt2<URI_> &
	Extend2<URI_> &
	Alternative2<URI_> &
	Monoidal2<URI_> = {
	//HKT
	URI: URI_,

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

	//Monoidal
	unit,
	mult,
};

export function combine<A, L>(a: RemoteData_<L, A>): RemoteData_<L, [A]>;
export function combine<A, B, L>(a: RemoteData_<L, A>, b: RemoteData_<L, B>): RemoteData_<L, [A, B]>;
export function combine<A, B, C, L>(
	a: RemoteData_<L, A>,
	b: RemoteData_<L, B>,
	c: RemoteData_<L, C>,
): RemoteData_<L, [A, B, C]>;
export function combine<A, B, C, D, L>(
	a: RemoteData_<L, A>,
	b: RemoteData_<L, B>,
	c: RemoteData_<L, C>,
	d: RemoteData_<L, D>,
): RemoteData_<L, [A, B, C, D]>;
export function combine<A, B, C, D, E, L>(
	a: RemoteData_<L, A>,
	b: RemoteData_<L, B>,
	c: RemoteData_<L, C>,
	d: RemoteData_<L, D>,
	e: RemoteData_<L, E>,
): RemoteData_<L, [A, B, C, D, E]>;
export function combine<A, B, C, D, E, F, L>(
	a: RemoteData_<L, A>,
	b: RemoteData_<L, B>,
	c: RemoteData_<L, C>,
	d: RemoteData_<L, D>,
	e: RemoteData_<L, E>,
	f: RemoteData_<L, F>,
): RemoteData_<L, [A, B, C, D, E, F]>;
export function combine<T, L>(...list: RemoteData_<L, T>[]): RemoteData_<L, T[]> {
	if (list.length === 0) {
		return of([]);
	}
	return sequence(remoteData, array)(list);
}
