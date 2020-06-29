import { RemoteData, RemoteFailure, RemoteInitial, RemotePending, RemoteProgress, RemoteSuccess } from './remote-data';
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable';
import { literal, number, type, Type, union } from 'io-ts/lib/index';

export type JSONRemoteProgress = {
	loaded: number;
	total: number | null;
};

export type JSONRemotePending = {
	_tag: 'RemotePending';
	progress: JSONRemoteProgress | null;
};

export type JSONRemoteData<E, A> = RemoteFailure<E> | RemoteInitial | JSONRemotePending | RemoteSuccess<A>;

const RemoteInitialCodec: Type<RemoteInitial> = type({
	_tag: literal('RemoteInitial'),
});

const RemoteProgressCodec: Type<RemoteProgress, JSONRemoteProgress> = type({
	loaded: number,
	total: optionFromNullable(number),
});

const RemotePendingCodec: Type<RemotePending, JSONRemotePending> = type({
	_tag: literal('RemotePending'),
	progress: optionFromNullable(RemoteProgressCodec),
});

export function createRemoteDataFromJSON<LA, LO, RA, RO>(
	leftCodec: Type<LA, LO>,
	rightCodec: Type<RA, RO>,
): Type<RemoteData<LA, RA>, JSONRemoteData<LO, RO>> {
	const RemoteFailureCodec = type({
		_tag: literal('RemoteFailure'),
		error: leftCodec,
	});
	const RemoteSuccessCodec = type({
		_tag: literal('RemoteSuccess'),
		value: rightCodec,
	});
	return union([RemoteInitialCodec, RemotePendingCodec, RemoteFailureCodec, RemoteSuccessCodec], '_tag');
}
