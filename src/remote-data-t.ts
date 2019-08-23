import {
	failure,
	fold,
	progress,
	RemoteData,
	remoteData,
	RemoteProgress,
	success,
	URI,
	initial,
	pending,
	fromOption,
} from './remote-data';

import {
	ApplicativeComposition12,
	ApplicativeComposition22,
	getApplicativeComposition,
	ApplicativeCompositionHKT2,
} from 'fp-ts/lib/Applicative';
import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from 'fp-ts/lib/HKT';
import { Monad, Monad1, Monad2, Monad3, Monad4 } from 'fp-ts/lib/Monad';
import { Option } from 'fp-ts/lib/Option';

export type RemoteDataT<M, E, A> = HKT<M, RemoteData<E, A>>;

export interface RemoteDataM<M> extends ApplicativeCompositionHKT2<M, URI> {
	readonly chain: <E, A, B>(ma: RemoteDataT<M, E, A>, f: (a: A) => RemoteDataT<M, E, B>) => RemoteDataT<M, E, B>;
	readonly alt: <E, A>(fx: RemoteDataT<M, E, A>, f: () => RemoteDataT<M, E, A>) => RemoteDataT<M, E, A>;
	readonly bimap: <E, A, N, B>(ma: RemoteDataT<M, E, A>, f: (e: E) => N, g: (a: A) => B) => RemoteDataT<M, N, B>;
	readonly mapLeft: <E, A, N>(ma: RemoteDataT<M, E, A>, f: (e: E) => N) => RemoteDataT<M, N, A>;
	readonly fold: <E, A, B>(
		ma: RemoteDataT<M, E, A>,
		onInitial: () => HKT<M, B>,
		onPending: (progress: Option<RemoteProgress>) => HKT<M, B>,
		onFailure: (error: E) => HKT<M, B>,
		onSuccess: (value: A) => HKT<M, B>,
	) => HKT<M, B>;
	readonly getOrElse: <E, A>(ma: RemoteDataT<M, E, A>, a: () => HKT<M, A>) => HKT<M, A>;
	readonly orElse: <E, A, N>(ma: RemoteDataT<M, E, A>, f: () => RemoteDataT<M, N, A>) => RemoteDataT<M, N, A>;
	readonly initial: RemoteDataT<M, never, never>;
	readonly pending: RemoteDataT<M, never, never>;
	readonly progress: (mp: RemoteProgress) => RemoteDataT<M, never, never>;
	readonly progressM: (mp: HKT<M, RemoteProgress>) => RemoteDataT<M, never, never>;
	readonly failure: <E>(e: E) => RemoteDataT<M, E, never>;
	readonly failureM: <E>(me: HKT<M, E>) => RemoteDataT<M, E, never>;
	readonly fromM: <A>(ma: HKT<M, A>) => RemoteDataT<M, never, A>;
	readonly fromOption: <E, A>(option: Option<A>, error: () => E) => RemoteDataT<M, E, A>;
}

export type RemoteDataT1<M extends URIS, E, A> = Kind<M, RemoteData<E, A>>;

export interface RemoteDataM1<M extends URIS> extends ApplicativeComposition12<M, URI> {
	readonly chain: <E, A, B>(ma: RemoteDataT1<M, E, A>, f: (a: A) => RemoteDataT1<M, E, B>) => RemoteDataT1<M, E, B>;
	readonly alt: <E, A>(fx: RemoteDataT1<M, E, A>, f: () => RemoteDataT1<M, E, A>) => RemoteDataT1<M, E, A>;
	readonly bimap: <E, A, N, B>(ma: RemoteDataT1<M, E, A>, f: (e: E) => N, g: (a: A) => B) => RemoteDataT1<M, N, B>;
	readonly mapLeft: <E, A, N>(ma: RemoteDataT1<M, E, A>, f: (e: E) => N) => RemoteDataT1<M, N, A>;
	readonly fold: <E, A, B>(
		ma: RemoteDataT1<M, E, A>,
		onInitial: () => Kind<M, B>,
		onPending: (progress: Option<RemoteProgress>) => Kind<M, B>,
		onFailure: (error: E) => Kind<M, B>,
		onSuccess: (value: A) => Kind<M, B>,
	) => Kind<M, B>;
	readonly getOrElse: <E, A>(ma: RemoteDataT1<M, E, A>, a: () => Kind<M, A>) => Kind<M, A>;
	readonly orElse: <E, A, N>(ma: RemoteDataT1<M, E, A>, f: () => RemoteDataT1<M, N, A>) => RemoteDataT1<M, N, A>;
	readonly initial: RemoteDataT1<M, never, never>;
	readonly pending: RemoteDataT1<M, never, never>;
	readonly progress: (mp: RemoteProgress) => RemoteDataT1<M, never, never>;
	readonly progressM: (mp: Kind<M, RemoteProgress>) => RemoteDataT1<M, never, never>;
	readonly failure: <E>(e: E) => RemoteDataT1<M, E, never>;
	readonly failureM: <E>(me: Kind<M, E>) => RemoteDataT1<M, E, never>;
	readonly fromM: <A>(ma: Kind<M, A>) => RemoteDataT1<M, never, A>;
	readonly fromOption: <E, A>(option: Option<A>, error: () => E) => RemoteDataT1<M, E, A>;
}

export type RemoteDataT2<M extends URIS2, R, E, A> = Kind2<M, R, RemoteData<E, A>>;

export interface RemoteDataM2<M extends URIS2> extends ApplicativeComposition22<M, URI> {
	readonly chain: <R, E, A, B>(
		ma: RemoteDataT2<M, R, E, A>,
		f: (a: A) => RemoteDataT2<M, R, E, B>,
	) => RemoteDataT2<M, R, E, B>;
	readonly alt: <R, E, A>(
		fx: RemoteDataT2<M, R, E, A>,
		f: () => RemoteDataT2<M, R, E, A>,
	) => RemoteDataT2<M, R, E, A>;
	readonly bimap: <R, E, A, N, B>(
		ma: RemoteDataT2<M, R, E, A>,
		f: (e: E) => N,
		g: (a: A) => B,
	) => RemoteDataT2<M, R, N, B>;
	readonly mapLeft: <R, E, A, N>(ma: RemoteDataT2<M, R, E, A>, f: (e: E) => N) => RemoteDataT2<M, R, N, A>;
	readonly fold: <R, E, A, B>(
		ma: RemoteDataT2<M, R, E, A>,
		onInitial: () => Kind2<M, R, B>,
		onPending: (progress: Option<RemoteProgress>) => Kind2<M, R, B>,
		onFailure: (error: E) => Kind2<M, R, B>,
		onSuccess: (value: A) => Kind2<M, R, B>,
	) => Kind2<M, R, B>;
	readonly getOrElse: <R, E, A>(ma: RemoteDataT2<M, R, E, A>, a: () => Kind2<M, R, A>) => Kind2<M, R, A>;
	readonly orElse: <R, E, A, N>(
		ma: RemoteDataT2<M, R, E, A>,
		f: () => RemoteDataT2<M, R, N, A>,
	) => RemoteDataT2<M, R, N, A>;
	readonly initial: RemoteDataT2<M, unknown, never, never>;
	readonly pending: RemoteDataT2<M, unknown, never, never>;
	readonly progress: (mp: RemoteProgress) => RemoteDataT2<M, unknown, never, never>;
	readonly progressM: <R>(mp: Kind2<M, R, RemoteProgress>) => RemoteDataT2<M, R, never, never>;
	readonly failure: <E>(e: E) => RemoteDataT2<M, unknown, E, never>;
	readonly failureM: <R, E>(me: Kind2<M, R, E>) => RemoteDataT2<M, R, E, never>;
	readonly fromM: <R, A>(ma: Kind2<M, R, A>) => RemoteDataT2<M, R, never, A>;
	readonly fromOption: <E, A>(option: Option<A>, error: () => E) => RemoteDataT2<M, unknown, E, A>;
}

export type RemoteDataT3<M extends URIS3, S, R, E, A> = Kind3<M, S, R, RemoteData<E, A>>;

export interface RemoteDataM3<M extends URIS4> {
	readonly map: <S, R, E, A, B>(fa: RemoteDataT3<M, S, R, E, A>, f: (a: A) => B) => RemoteDataT3<M, S, R, E, B>;
	readonly of: <S, R, E, A>(a: A) => RemoteDataT3<M, S, R, E, A>;
	readonly ap: <S, R, E, A, B>(
		fab: RemoteDataT3<M, S, R, E, (a: A) => B>,
		fa: RemoteDataT3<M, S, R, E, A>,
	) => RemoteDataT3<M, S, R, E, B>;
	readonly chain: <S, R, E, A, B>(
		ma: RemoteDataT3<M, S, R, E, A>,
		f: (a: A) => RemoteDataT3<M, S, R, E, B>,
	) => RemoteDataT3<M, S, R, E, B>;
	readonly alt: <S, R, E, A>(
		fx: RemoteDataT3<M, S, R, E, A>,
		f: () => RemoteDataT3<M, S, R, E, A>,
	) => RemoteDataT3<M, S, R, E, A>;
	readonly bimap: <S, R, E, A, N, B>(
		ma: RemoteDataT3<M, S, R, E, A>,
		f: (e: E) => N,
		g: (a: A) => B,
	) => RemoteDataT3<M, S, R, N, B>;
	readonly mapLeft: <S, R, E, A, N>(ma: RemoteDataT3<M, S, R, E, A>, f: (e: E) => N) => RemoteDataT3<M, S, R, N, A>;
	readonly fold: <S, R, E, A, B>(
		ma: RemoteDataT3<M, S, R, E, A>,
		onInitial: () => Kind3<M, S, R, B>,
		onPending: (progress: Option<RemoteProgress>) => Kind3<M, S, R, B>,
		onFailure: (error: E) => Kind3<M, S, R, B>,
		onSuccess: (value: A) => Kind3<M, S, R, B>,
	) => Kind3<M, S, R, B>;
	readonly getOrElse: <S, R, E, A>(ma: RemoteDataT3<M, S, R, E, A>, a: () => Kind3<M, S, R, A>) => Kind3<M, S, R, A>;
	readonly orElse: <S, R, E, A, N>(
		ma: RemoteDataT3<M, S, R, E, A>,
		f: () => RemoteDataT3<M, S, R, N, A>,
	) => RemoteDataT3<M, S, R, N, A>;
	readonly initial: RemoteDataT3<M, unknown, unknown, never, never>;
	readonly pending: RemoteDataT3<M, unknown, unknown, never, never>;
	readonly progress: (mp: RemoteProgress) => RemoteDataT3<M, unknown, unknown, never, never>;
	readonly progressM: <S, R>(mp: Kind3<M, S, R, RemoteProgress>) => RemoteDataT3<M, S, R, never, never>;
	readonly failure: <E>(e: E) => RemoteDataT3<M, unknown, unknown, E, never>;
	readonly failureM: <S, R, E>(me: Kind3<M, S, R, E>) => RemoteDataT3<M, S, R, E, never>;
	readonly fromM: <S, R, A>(ma: Kind3<M, S, R, A>) => RemoteDataT3<M, S, R, never, A>;
	readonly fromOption: <E, A>(option: Option<A>, error: () => E) => RemoteDataT3<M, unknown, unknown, E, A>;
}

export type RemoteDataT4<M extends URIS4, T, S, R, E, A> = Kind4<M, T, S, R, RemoteData<E, A>>;

export interface RemoteDataM4<M extends URIS4> {
	readonly map: <T, S, R, E, A, B>(
		fa: RemoteDataT4<M, T, S, R, E, A>,
		f: (a: A) => B,
	) => RemoteDataT4<M, T, S, R, E, B>;
	readonly of: <T, S, R, E, A>(a: A) => RemoteDataT4<M, T, S, R, E, A>;
	readonly ap: <T, S, R, E, A, B>(
		fab: RemoteDataT4<M, T, S, R, E, (a: A) => B>,
		fa: RemoteDataT4<M, T, S, R, E, A>,
	) => RemoteDataT4<M, T, S, R, E, B>;
	readonly chain: <T, S, R, E, A, B>(
		ma: RemoteDataT4<M, T, S, R, E, A>,
		f: (a: A) => RemoteDataT4<M, T, S, R, E, B>,
	) => RemoteDataT4<M, T, S, R, E, B>;
	readonly alt: <T, S, R, E, A>(
		fx: RemoteDataT4<M, T, S, R, E, A>,
		f: () => RemoteDataT4<M, T, S, R, E, A>,
	) => RemoteDataT4<M, T, S, R, E, A>;
	readonly bimap: <T, S, R, E, A, N, B>(
		ma: RemoteDataT4<M, T, S, R, E, A>,
		f: (e: E) => N,
		g: (a: A) => B,
	) => RemoteDataT4<M, T, S, R, N, B>;
	readonly mapLeft: <T, S, R, E, A, N>(
		ma: RemoteDataT4<M, T, S, R, E, A>,
		f: (e: E) => N,
	) => RemoteDataT4<M, T, S, R, N, A>;
	readonly fold: <T, S, R, E, A, B>(
		ma: RemoteDataT4<M, T, S, R, E, A>,
		onInitial: () => Kind4<M, T, S, R, B>,
		onPending: (progress: Option<RemoteProgress>) => Kind4<M, T, S, R, B>,
		onFailure: (error: E) => Kind4<M, T, S, R, B>,
		onSuccess: (value: A) => Kind4<M, T, S, R, B>,
	) => Kind4<M, T, S, R, B>;
	readonly getOrElse: <T, S, R, E, A>(
		ma: RemoteDataT4<M, T, S, R, E, A>,
		a: () => Kind4<M, T, S, R, A>,
	) => Kind4<M, T, S, R, A>;
	readonly orElse: <T, S, R, E, A, N>(
		ma: RemoteDataT4<M, T, S, R, E, A>,
		f: () => RemoteDataT4<M, T, S, R, N, A>,
	) => RemoteDataT4<M, T, S, R, N, A>;
	readonly initial: RemoteDataT4<M, unknown, unknown, unknown, never, never>;
	readonly pending: RemoteDataT4<M, unknown, unknown, unknown, never, never>;
	readonly progress: (mp: RemoteProgress) => RemoteDataT4<M, unknown, unknown, unknown, never, never>;
	readonly progressM: <T, S, R>(mp: Kind4<M, T, S, R, RemoteProgress>) => RemoteDataT4<M, T, S, R, never, never>;
	readonly failure: <E>(e: E) => RemoteDataT4<M, unknown, unknown, unknown, E, never>;
	readonly failureM: <T, S, R, E>(me: Kind4<M, T, S, R, E>) => RemoteDataT4<M, T, S, R, E, never>;
	readonly fromM: <T, S, R, A>(ma: Kind4<M, T, S, R, A>) => RemoteDataT4<M, T, S, R, never, A>;
	readonly fromOption: <E, A>(option: Option<A>, error: () => E) => RemoteDataT4<M, unknown, unknown, unknown, E, A>;
}

export function getRemoteDataM<M extends URIS4>(M: Monad4<M>): RemoteDataM4<M>;
export function getRemoteDataM<M extends URIS3>(M: Monad3<M>): RemoteDataM3<M>;
export function getRemoteDataM<M extends URIS2>(M: Monad2<M>): RemoteDataM2<M>;
export function getRemoteDataM<M extends URIS>(M: Monad1<M>): RemoteDataM1<M>;
export function getRemoteDataM<M>(M: Monad<M>): RemoteDataM<M>;
export function getRemoteDataM<M>(M: Monad<M>): RemoteDataM<M> {
	const A = getApplicativeComposition(M, remoteData);

	return {
		...A,
		chain: (fa, f) => M.chain(fa, a => (a._tag === 'RemoteSuccess' ? f(a.value) : M.of(a))),
		alt: (fa, f) => M.chain(fa, a => (a._tag === 'RemoteSuccess' ? A.of(a.value) : f())),
		bimap: (fa, f, g) => M.map(fa, a => remoteData.bimap(a, f, g)),
		mapLeft: (ma, f) => M.map(ma, a => remoteData.mapLeft(a, f)),
		fold: (ma, onInitial, onPending, onFailure, onSuccess) =>
			M.chain(ma, fold(onInitial, onPending, onFailure, onSuccess)),
		getOrElse: (ma, a) => M.chain(ma, fold(a, a, a, M.of)),
		orElse: (ma, f) => M.chain(ma, fold(f, f, f, a => A.of(a))),
		initial: M.of(initial),
		pending: M.of(pending),
		progress: p => M.of(progress(p)),
		progressM: mp => M.map(mp, progress),
		failure: e => M.of(failure(e)),
		failureM: me => M.map(me, failure),
		fromM: ma => M.map(ma, success),
		fromOption: (a, e) => M.of(fromOption(a, e)),
	};
}
