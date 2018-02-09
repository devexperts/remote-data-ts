import { constFalse, Lazy } from "fp-ts/lib/function";
import { FantasyMonad, Monad } from "fp-ts/lib/Monad";
import { FantasyFoldable, Foldable } from "fp-ts/lib/Foldable";
import { Alt, FantasyAlt } from "fp-ts/lib/Alt";
import { Extend, FantasyExtend } from "fp-ts/lib/Extend";
import { FantasyTraversable, sequence } from "fp-ts/lib/Traversable";
import { Applicative } from "fp-ts/lib/Applicative";
import { HKT2S, HKT2, HKTS, HKT, HKT2As, HKTAs } from "fp-ts/lib/HKT";
import { isNone, none, Option, some } from "fp-ts/lib/Option";
import { Either, isLeft } from "fp-ts/lib/Either";
import { Setoid } from "fp-ts/lib/Setoid";
import { array } from "fp-ts/lib/Array";

export const URI = "RemoteData";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
	//not that order of type arguments should be reveresed
	interface URI2HKT2<L, A> {
		RemoteData: RemoteData<A, L>;
	}
}

export enum RemoteDataStatus {
	Initial = "Initial",
	Pending = "Pending",
	Failure = "Failure",
	Success = "Success"
}

//tslint:disable no-any no-use-before-declare
export class RemoteInitial<A, L>
	implements FantasyMonad<URI, A>,
		FantasyFoldable<A>,
		FantasyAlt<URI, A>,
		FantasyExtend<URI, A>,
		FantasyTraversable<URI, A> {
	readonly ["_URI"]: URI;
	readonly ["_A"]: A;
	readonly ["_L"]: L;
	readonly status = RemoteDataStatus.Initial;

	alt(fy: RemoteData<A, L>): RemoteData<A, L> {
		return fy;
	}

	ap<B>(fab: RemoteData<(a: A) => B, L>): RemoteData<B, L> {
		return this as any;
	}

	chain<B>(f: (a: A) => RemoteData<B, L>): RemoteData<B, L> {
		return this as any;
	}

	extend<B>(f: (ea: RemoteData<A, L>) => B): RemoteData<B, L> {
		return this as any;
	}

	fold<B>(
		initial: Lazy<B>,
		pending: Lazy<B>,
		failure: (failure: L) => B,
		success: (success: A) => B
	): B {
		return initial();
	}

	getOrElse(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData<B, L> {
		return this as any;
	}

	getOrElseValue(value: A): A {
		return value;
	}

	reduce<B>(f: (b: B, a: A) => B, b: B): B {
		return b;
	}

	traverse<F extends HKT2S>(
		F: Applicative<F>
	): <L, B>(f: (a: A) => HKT2<F, L, B>) => HKT2As<F, L, RemoteData<B, L>>;
	traverse<F extends HKTS>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKTAs<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>> {
		return f => F.of(this as any);
	}

	isPending(): this is RemotePending<A, L> {
		return false;
	}

	isFailure(): this is RemoteFailure<A, L> {
		return false;
	}

	isSuccess(): this is RemoteSuccess<A, L> {
		return false;
	}

	isInitial(): this is RemoteInitial<A, L> {
		return true;
	}

	toOption(): Option<A> {
		return none;
	}

	toNullable(): A | null {
		return null;
	}
}

export class RemoteFailure<A, L>
	implements FantasyMonad<URI, A>,
		FantasyFoldable<A>,
		FantasyAlt<URI, A>,
		FantasyExtend<URI, A>,
		FantasyTraversable<URI, A> {
	readonly ["_URI"]: URI;
	readonly ["_A"]: A;
	readonly ["_L"]: L;
	readonly status = RemoteDataStatus.Failure;

	constructor(readonly error: L) {}

	alt(fy: RemoteData<A, L>): RemoteData<A, L> {
		return fy;
	}

	ap<B>(fab: RemoteData<(a: A) => B, L>): RemoteData<B, L> {
		return fab.status === RemoteDataStatus.Failure ? fab : (this as any);
	}

	chain<B>(f: (a: A) => RemoteData<B, L>): RemoteData<B, L> {
		return this as any;
	}

	extend<B>(f: (ea: RemoteData<A, L>) => B): RemoteData<B, L> {
		return this as any;
	}

	fold<B>(
		initial: Lazy<B>,
		pending: Lazy<B>,
		failure: (failure: L) => B,
		success: (success: A) => B
	): B {
		return failure(this.error);
	}

	getOrElse(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData<B, L> {
		return this as any;
	}

	getOrElseValue(value: A): A {
		return value;
	}

	reduce<B>(f: (b: B, a: A) => B, b: B): B {
		return b;
	}

	traverse<F extends HKT2S>(
		F: Applicative<F>
	): <L, B>(f: (a: A) => HKT2<F, L, B>) => HKT2As<F, L, RemoteData<B, L>>;
	traverse<F extends HKTS>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKTAs<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>> {
		return f => F.of(this as any);
	}

	isInitial(): this is RemoteInitial<A, L> {
		return false;
	}

	isPending(): this is RemotePending<A, L> {
		return false;
	}

	isFailure(): this is RemoteFailure<A, L> {
		return true;
	}

	isSuccess(): this is RemoteSuccess<A, L> {
		return false;
	}

	toOption(): Option<A> {
		return none;
	}

	toNullable(): A | null {
		return null;
	}
}

export class RemoteSuccess<A, L>
	implements FantasyMonad<URI, A>,
		FantasyFoldable<A>,
		FantasyAlt<URI, A>,
		FantasyExtend<URI, A>,
		FantasyTraversable<URI, A> {
	readonly ["_URI"]: URI;
	readonly ["_A"]: A;
	readonly ["_L"]: L;
	readonly status = RemoteDataStatus.Success;

	constructor(readonly value: A) {}

	alt(fy: RemoteData<A, L>): RemoteData<A, L> {
		return this;
	}

	ap<B>(fab: RemoteData<(a: A) => B, L>): RemoteData<B, L> {
		return fab.status === RemoteDataStatus.Success
			? this.map(fab.value)
			: (fab as any);
	}

	chain<B>(f: (a: A) => RemoteData<B, L>): RemoteData<B, L> {
		return f(this.value);
	}

	extend<B>(f: (ea: RemoteData<A, L>) => B): RemoteData<B, L> {
		return RemoteDataUtils.success<B, L>(f(this));
	}

	fold<B>(
		initial: Lazy<B>,
		pending: Lazy<B>,
		failure: (failure: L) => B,
		success: (success: A) => B
	): B {
		return success(this.value);
	}

	getOrElse(f: Lazy<A>): A {
		return this.value;
	}

	map<B>(f: (a: A) => B): RemoteData<B, L> {
		return RemoteDataUtils.success<B, L>(f(this.value));
	}

	getOrElseValue(value: A): A {
		return this.value;
	}

	reduce<B>(f: (b: B, a: A) => B, b: B): B {
		return f(b, this.value);
	}

	traverse<F extends HKT2S>(
		F: Applicative<F>
	): <M, B>(f: (a: A) => HKT2<F, M, B>) => HKT2As<F, M, RemoteData<B, L>>;
	traverse<F extends HKTS>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKTAs<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>> {
		return f =>
			F.map(b => RemoteDataUtils.success<any, L>(b), f(this.value));
	}

	isInitial(): this is RemoteInitial<A, L> {
		return false;
	}

	isPending(): this is RemotePending<A, L> {
		return false;
	}

	isFailure(): this is RemoteFailure<A, L> {
		return false;
	}

	isSuccess(): this is RemoteSuccess<A, L> {
		return true;
	}

	toOption(): Option<A> {
		return some(this.value);
	}

	toNullable(): A | null {
		return this.value;
	}
}

export class RemotePending<A, L>
	implements FantasyMonad<URI, A>,
		FantasyFoldable<A>,
		FantasyAlt<URI, A>,
		FantasyExtend<URI, A>,
		FantasyTraversable<URI, A> {
	readonly ["_URI"]: URI;
	readonly ["_A"]: A;
	readonly ["_L"]: L;
	readonly status = RemoteDataStatus.Pending;

	alt(fy: RemoteData<A, L>): RemoteData<A, L> {
		return fy;
	}

	ap<B>(fab: RemoteData<(a: A) => B, L>): RemoteData<B, L> {
		return this as any;
	}

	chain<B>(f: (a: A) => RemoteData<B, L>): RemoteData<B, L> {
		return this as any;
	}

	extend<B>(f: (ea: RemoteData<A, L>) => B): RemoteData<B, L> {
		return this as any;
	}

	fold<B>(
		initial: Lazy<B>,
		pending: Lazy<B>,
		failure: (failure: L) => B,
		success: (success: A) => B
	): B {
		return pending();
	}

	getOrElse(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData<B, L> {
		return this as any;
	}

	getOrElseValue(value: A): A {
		return value;
	}

	reduce<B>(f: (b: B, a: A) => B, b: B): B {
		return b;
	}

	traverse<F extends HKT2S>(
		F: Applicative<F>
	): <L, B>(f: (a: A) => HKT2<F, L, B>) => HKT2As<F, L, RemoteData<B, L>>;
	traverse<F extends HKTS>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKTAs<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>>;
	traverse<F>(
		F: Applicative<F>
	): <B>(f: (a: A) => HKT<F, B>) => HKT<F, RemoteData<B, L>> {
		return f => F.of(this as any);
	}

	isInitial(): this is RemoteInitial<A, L> {
		return false;
	}

	isPending(): this is RemotePending<A, L> {
		return true;
	}

	isFailure(): this is RemoteFailure<A, L> {
		return false;
	}

	isSuccess(): this is RemoteSuccess<A, L> {
		return false;
	}

	toOption(): Option<A> {
		return none;
	}

	toNullable(): A | null {
		return null;
	}
}

export type RemoteData<A, L = Error> =
	| RemoteInitial<A, L>
	| RemoteFailure<A, L>
	| RemoteSuccess<A, L>
	| RemotePending<A, L>;

export namespace RemoteDataUtils {
	export const failure = <A, L = Error>(error: L): RemoteFailure<A, L> =>
		new RemoteFailure(error);
	export const success = <A, L = Error>(value: A): RemoteSuccess<A, L> =>
		new RemoteSuccess(value);
	export const pending: RemotePending<never, never> = new RemotePending<
		never,
		never
	>();
	export const initial: RemoteInitial<never, never> = new RemoteInitial<
		never,
		never
	>();

	export const isFailure = <A, L>(
		data: RemoteData<A, L>
	): data is RemoteFailure<A, L> => data.isFailure();
	export const isSuccess = <A, L>(
		data: RemoteData<A, L>
	): data is RemoteSuccess<A, L> => data.isSuccess();
	export const isPending = <A, L>(
		data: RemoteData<A, L>
	): data is RemotePending<A, L> => data.isPending();
	export const isInitial = <A, L>(
		data: RemoteData<A, L>
	): data is RemoteInitial<A, L> => data.isInitial();

	export const getSetoid = <A, L>(S: Setoid<A>): Setoid<RemoteData<A, L>> => {
		return {
			equals: x => y => {
				return x.fold(
					() => y.isInitial(),
					() => y.isPending(),
					xError =>
						y.fold(
							constFalse,
							constFalse,
							yError => yError === xError,
							constFalse
						),
					ax =>
						y.fold(constFalse, constFalse, constFalse, ay =>
							S.equals(ax)(ay)
						)
				);
			}
		};
	};

	export const getCommonStatus = (
		statuses: RemoteDataStatus[]
	): RemoteDataStatus => {
		if (statuses.indexOf(RemoteDataStatus.Pending) !== -1) {
			return RemoteDataStatus.Pending;
		} else if (statuses.indexOf(RemoteDataStatus.Failure) !== -1) {
			return RemoteDataStatus.Failure;
		} else if (
			statuses.every(status => status === RemoteDataStatus.Success)
		) {
			return RemoteDataStatus.Success;
		} else {
			return RemoteDataStatus.Initial;
		}
	};

	export function fromOption<A, L>(
		option: Option<A>,
		error: Lazy<L>
	): RemoteData<A, L> {
		if (isNone(option)) {
			return failure<A, L>(error());
		} else {
			return success<A, L>(option.value);
		}
	}

	export function fromEither<A, L>(either: Either<L, A>): RemoteData<A, L> {
		if (isLeft(either)) {
			return failure<A, L>(either.value);
		} else {
			return success<A, L>(either.value);
		}
	}

	export function combine<A, L>(a: RemoteData<A, L>): RemoteData<[A], L>;
	export function combine<A, B, L>(
		a: RemoteData<A, L>,
		b: RemoteData<B, L>
	): RemoteData<[A, B], L>;
	export function combine<A, B, C, L>(
		a: RemoteData<A, L>,
		b: RemoteData<B, L>,
		c: RemoteData<C, L>
	): RemoteData<[A, B, C], L>;
	export function combine<A, B, C, D, L>(
		a: RemoteData<A, L>,
		b: RemoteData<B, L>,
		c: RemoteData<C, L>,
		d: RemoteData<D, L>
	): RemoteData<[A, B, C, D], L>;
	export function combine<T, L>(
		...list: RemoteData<T, L>[]
	): RemoteData<T[], L> {
		return sequence(remoteData, array)(list);
	}
}

export const remoteData: Monad<URI> & Foldable<URI> & Alt<URI> & Extend<URI> = {
	//HKT
	URI,

	//Monad
	of: RemoteDataUtils.success,
	ap: <L, A, B>(
		fab: RemoteData<(a: A) => B, L>,
		fa: RemoteData<A, L>
	): RemoteData<B, L> => fa.ap(fab),
	map: <L, A, B>(f: (a: A) => B, fa: RemoteData<A, L>): RemoteData<B, L> =>
		fa.map(f),
	chain: <L, A, B>(
		f: (a: A) => RemoteData<B, L>,
		fa: RemoteData<A, L>
	): RemoteData<B, L> => fa.chain(f),

	//Foldable
	reduce: <L, A, B>(f: (b: B, a: A) => B, b: B, fa: RemoteData<A, L>): B =>
		fa.reduce(f, b),

	//Alt
	alt: <L, A>(fa: RemoteData<A, L>, fb: RemoteData<A, L>): RemoteData<A, L> =>
		fa.alt(fb),

	//Extend
	extend: <L, A, B>(
		f: (fla: RemoteData<A, L>) => B,
		fla: RemoteData<A, L>
	): RemoteData<B, L> => fla.extend(f)
};
