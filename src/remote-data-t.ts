import * as RD from './remote-data';
import { RemoteData, remoteData, URI } from './remote-data';

import {
	ApplicativeComposition,
	ApplicativeComposition12,
	ApplicativeComposition22,
	getApplicativeComposition,
	Applicative2,
	Applicative1,
	Applicative,
} from 'fp-ts/lib/Applicative';
import { HKT, Type, Type2, URIS, URIS2 } from 'fp-ts/lib/HKT';
import { Monad, Monad1, Monad2 } from 'fp-ts/lib/Monad';
import { Functor2, Functor1, Functor } from 'fp-ts/lib/Functor';
import { Function1, Lazy } from 'fp-ts/lib/function';

export interface RemoteDataT<F> extends ApplicativeComposition<F, URI> {
	readonly chain: <L, A, B>(
		f: (a: A) => HKT<F, RemoteData<L, B>>,
		fa: HKT<F, RemoteData<L, A>>,
	) => HKT<F, RemoteData<L, B>>;
}

export interface RemoteDataT1<F extends URIS> extends ApplicativeComposition12<F, URI> {
	readonly chain: <L, A, B>(
		f: (a: A) => Type<F, RemoteData<L, B>>,
		fa: Type<F, RemoteData<L, A>>,
	) => Type<F, RemoteData<L, B>>;
}

export interface RemoteDataT2<F extends URIS2> extends ApplicativeComposition22<F, URI> {
	readonly chain: <L, M, A, B>(
		f: (a: A) => Type2<F, M, RemoteData<L, B>>,
		fa: Type2<F, M, RemoteData<L, A>>,
	) => Type2<F, M, RemoteData<L, B>>;
}

export function chain<F extends URIS2>(F: Monad2<F>): RemoteDataT2<F>['chain'];
export function chain<F extends URIS>(F: Monad1<F>): RemoteDataT1<F>['chain'];
export function chain<F>(F: Monad<F>): RemoteDataT<F>['chain'];
export function chain<F>(F: Monad<F>): RemoteDataT<F>['chain'] {
	return (f, fa) =>
		F.chain(fa, e => {
			switch (e._tag) {
				case 'RemoteInitial':
					return F.of(RD.initial);
				case 'RemotePending':
					return F.of(RD.pending);
				case 'RemoteFailure':
					return F.of(RD.failure(e.error));
				case 'RemoteSuccess':
					return f(e.value);
			}
		});
}

export function success<F extends URIS2>(
	F: Functor2<F>,
): <L, M, A>(fa: Type2<F, M, A>) => Type2<F, M, RemoteData<L, A>>;
export function success<F extends URIS>(F: Functor1<F>): <L, A>(fa: Type<F, A>) => Type<F, RemoteData<L, A>>;
export function success<F>(F: Functor<F>): <L, A>(fa: HKT<F, A>) => HKT<F, RemoteData<L, A>>;
export function success<F>(F: Functor<F>): <L, A>(fa: HKT<F, A>) => HKT<F, RemoteData<L, A>> {
	return ma => F.map(ma, a => RD.success(a));
}

export function failure<F extends URIS2>(
	F: Functor2<F>,
): <L, M, A>(fl: Type2<F, M, L>) => Type2<F, M, RemoteData<L, A>>;
export function failure<F extends URIS>(F: Functor1<F>): <L, A>(fl: Type<F, L>) => Type<F, RemoteData<L, A>>;
export function failure<F>(F: Functor<F>): <L, A>(fl: HKT<F, L>) => HKT<F, RemoteData<L, A>>;
export function failure<F>(F: Functor<F>): <L, A>(fl: HKT<F, L>) => HKT<F, RemoteData<L, A>> {
	return ml => F.map(ml, l => RD.failure(l));
}

export function fromEither<F extends URIS2>(
	F: Applicative2<F>,
): <L, M, A>(fa: RemoteData<L, A>) => Type2<F, M, RemoteData<L, A>>;
export function fromEither<F extends URIS>(
	F: Applicative1<F>,
): <L, A>(fa: RemoteData<L, A>) => Type<F, RemoteData<L, A>>;
export function fromEither<F>(F: Applicative<F>): <L, A>(fa: RemoteData<L, A>) => HKT<F, RemoteData<L, A>>;
export function fromEither<F>(F: Applicative<F>): <L, A>(fa: RemoteData<L, A>) => HKT<F, RemoteData<L, A>> {
	return oa => F.of(oa);
}

export function fold<F extends URIS2>(
	F: Functor2<F>,
): <B, L, M, A>(
	initial: B,
	pending: B,
	failure: (l: L) => B,
	success: (a: A) => B,
	fa: Type2<F, M, RemoteData<L, A>>,
) => Type2<F, M, B>;
export function fold<F extends URIS>(
	F: Functor1<F>,
): <B, L, A>(
	initial: B,
	pending: B,
	failure: (l: L) => B,
	success: (a: A) => B,
	fa: Type<F, RemoteData<L, A>>,
) => Type<F, B>;
export function fold<F>(
	F: Functor<F>,
): <B, L, A>(
	initial: B,
	pending: B,
	failure: Function1<L, B>,
	success: Function1<A, B>,
	fa: HKT<F, RemoteData<L, A>>,
) => HKT<F, B> {
	return (initial, pending, failure, success, fa) =>
		F.map(fa, e => {
			switch (e._tag) {
				case 'RemoteInitial':
					return initial;
				case 'RemotePending':
					return pending;
				case 'RemoteFailure':
					return failure(e.error);
				case 'RemoteSuccess':
					return success(e.value);
			}
		});
}

export function foldL<F extends URIS2>(
	F: Functor2<F>,
): <B, L, M, A>(
	initial: Lazy<B>,
	pending: Lazy<B>,
	failure: (l: L) => B,
	success: (a: A) => B,
	fa: Type2<F, M, RemoteData<L, A>>,
) => Type2<F, M, B>;
export function foldL<F extends URIS>(
	F: Functor1<F>,
): <B, L, A>(
	initial: Lazy<B>,
	pending: Lazy<B>,
	failure: (l: L) => B,
	success: (a: A) => B,
	fa: Type<F, RemoteData<L, A>>,
) => Type<F, B>;
export function foldL<F>(
	F: Functor<F>,
): <B, L, A>(
	initial: Lazy<B>,
	pending: Lazy<B>,
	failure: Function1<L, B>,
	success: Function1<A, B>,
	fa: HKT<F, RemoteData<L, A>>,
) => HKT<F, B> {
	return (initial, pending, failure, success, fa) =>
		F.map(fa, e => {
			switch (e._tag) {
				case 'RemoteInitial':
					return initial();
				case 'RemotePending':
					return pending();
				case 'RemoteFailure':
					return failure(e.error);
				case 'RemoteSuccess':
					return success(e.value);
			}
		});
}

export function getRemoteDataT<M extends URIS2>(M: Monad2<M>): RemoteDataT2<M>;
export function getRemoteDataT<M extends URIS>(M: Monad1<M>): RemoteDataT1<M>;
export function getRemoteDataT<M>(M: Monad<M>): RemoteDataT<M>;
export function getRemoteDataT<M>(M: Monad<M>): RemoteDataT<M> {
	const applicativeComposition = getApplicativeComposition(M, remoteData);

	return {
		...applicativeComposition,
		chain: chain(M),
	};
}
