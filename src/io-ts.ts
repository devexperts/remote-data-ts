import * as t from 'io-ts';
import { createOptionFromNullable } from 'io-ts-types';

import {
	failure,
	initial,
	pending,
	RemoteData,
	RemoteFailure,
	RemoteInitial,
	RemotePending,
	RemoteSuccess,
	success,
	RemoteProgress,
	progress,
} from './remote-data';

export interface JSONFailure<L> {
	type: 'Failure';
	error: L;
}

export interface JSONInitial {
	type: 'Initial';
}

export interface JSONPending {
	type: 'Pending';
	progress: RemoteProgress | null;
}

export interface JSONSuccess<A> {
	type: 'Success';
	value: A;
}

export type JSONRemoteData<L, A> = JSONFailure<L> | JSONInitial | JSONPending | JSONSuccess<A>;

export class RemoteDataFromJSONType<L extends t.Any, R extends t.Any, A = any, O = A, I = t.mixed> extends t.Type<
	A,
	O,
	I
> {
	readonly _tag: 'RemoteDataFromJSONType' = 'RemoteDataFromJSONType';
	constructor(
		name: string,
		is: RemoteDataFromJSONType<L, R, A, O, I>['is'],
		validate: RemoteDataFromJSONType<L, R, A, O, I>['validate'],
		serialize: RemoteDataFromJSONType<L, R, A, O, I>['encode'],
		readonly left: L,
		readonly right: R,
	) {
		super(name, is, validate, serialize);
	}
}

export function createRemoteDataFromJSON<
	L extends t.Type<AL, OL>,
	R extends t.Type<AR, OR>,
	AL = t.TypeOf<L>,
	OL = t.OutputOf<L>,
	AR = t.TypeOf<R>,
	OR = t.OutputOf<R>
>(
	leftType: L,
	rightType: R,
	name: string = `RemoteData<${leftType.name}, ${rightType.name}>`,
): RemoteDataFromJSONType<L, R, RemoteData<AL, AR>, JSONRemoteData<OL, OR>, t.mixed> {
	const JSONProgress = createOptionFromNullable(
		t.type({
			loaded: t.number,
			total: createOptionFromNullable(t.number),
		}),
	);
	const JSONFailure = t.type({
		type: t.literal('Failure'),
		error: leftType,
	});
	const JSONInitial = t.type({
		type: t.literal('Initial'),
	});
	const JSONPending = t.type({
		type: t.literal('Pending'),
		progress: JSONProgress,
	});
	const JSONSuccess = t.type({
		type: t.literal('Success'),
		value: rightType,
	});
	const JSONRemoteData = t.taggedUnion('type', [JSONFailure, JSONInitial, JSONPending, JSONSuccess]);
	return new RemoteDataFromJSONType(
		name,
		(m): m is RemoteData<AL, AR> =>
			m instanceof RemoteInitial ||
			m instanceof RemotePending ||
			(m instanceof RemoteFailure && leftType.is(m.error)) ||
			(m instanceof RemoteSuccess && rightType.is(m.value)),
		(m, c) => {
			const validation = JSONRemoteData.validate(m, c);
			if (validation.isLeft()) {
				return validation as any;
			} else {
				const e = validation.value;
				switch (e.type) {
					case 'Failure':
						return t.success(failure(e.error));
					case 'Initial':
						return t.success(initial);
					case 'Pending':
						return e.progress.foldL(() => t.success(pending), p => t.success(progress(p)));
					case 'Success':
						return t.success(success(e.value));
				}
			}
		},
		a =>
			a.foldL<JSONRemoteData<OL, OR>>(
				() => ({ type: 'Initial' }),
				() => ({ type: 'Pending', progress: JSONProgress.encode((a as any).progress) }),
				l => ({ type: 'Failure', error: leftType.encode(l) }),
				a => ({ type: 'Success', value: rightType.encode(a) }),
			),
		leftType,
		rightType,
	);
}
