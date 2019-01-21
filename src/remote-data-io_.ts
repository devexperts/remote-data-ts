import * as t from 'io-ts';
import { createOptionFromNullable } from 'io-ts-types';

import {
	failure,
	initial,
	pending,
	RemoteData_,
	RemoteFailure_,
	RemoteInitial_,
	RemotePending_,
	RemoteSuccess_,
	success,
	RemoteProgress_,
	progress,
} from './remote-data_';

//tslint:disable-next-line class-name
export interface JSONFailure_<L> {
	type: 'Failure_';
	error: L;
}

//tslint:disable-next-line class-name
export interface JSONInitial_ {
	type: 'Initial_';
}

//tslint:disable-next-line class-name
export interface JSONPending_ {
	type: 'Pending_';
	progress: RemoteProgress_ | null;
}

//tslint:disable-next-line class-name
export interface JSONSuccess_<A> {
	type: 'Success_';
	value: A;
}

//tslint:disable-next-line class-name
export type JSONRemoteData_<L, A> = JSONFailure_<L> | JSONInitial_ | JSONPending_ | JSONSuccess_<A>;

//tslint:disable-next-line class-name
export class RemoteDataFromJSONType_<L extends t.Any, R extends t.Any, A = any, O = A, I = t.mixed> extends t.Type<
	A,
	O,
	I
> {
	readonly _tag: 'RemoteDataFromJSONType_' = 'RemoteDataFromJSONType_';
	constructor(
		name: string,
		is: RemoteDataFromJSONType_<L, R, A, O, I>['is'],
		validate: RemoteDataFromJSONType_<L, R, A, O, I>['validate'],
		serialize: RemoteDataFromJSONType_<L, R, A, O, I>['encode'],
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
	name: string = `RemoteData_<${leftType.name}, ${rightType.name}>`,
): RemoteDataFromJSONType_<L, R, RemoteData_<AL, AR>, JSONRemoteData_<OL, OR>, t.mixed> {
	const JSONProgress = createOptionFromNullable(
		t.type({
			loaded: t.number,
			total: createOptionFromNullable(t.number),
		}),
	);
	const JSONFailure = t.type({
		type: t.literal('Failure_'),
		error: leftType,
	});
	const JSONInitial = t.type({
		type: t.literal('Initial_'),
	});
	const JSONPending = t.type({
		type: t.literal('Pending_'),
		progress: JSONProgress,
	});
	const JSONSuccess = t.type({
		type: t.literal('Success_'),
		value: rightType,
	});
	const JSONRemoteData = t.taggedUnion('type', [JSONFailure, JSONInitial, JSONPending, JSONSuccess]);
	return new RemoteDataFromJSONType_(
		name,
		(m): m is RemoteData_<AL, AR> =>
			m instanceof RemoteInitial_ ||
			m instanceof RemotePending_ ||
			(m instanceof RemoteFailure_ && leftType.is(m.error)) ||
			(m instanceof RemoteSuccess_ && rightType.is(m.value)),
		(m, c) => {
			const validation = JSONRemoteData.validate(m, c);
			if (validation.isLeft()) {
				return validation as any;
			} else {
				const e = validation.value;
				switch (e.type) {
					case 'Failure_':
						return t.success(failure(e.error));
					case 'Initial_':
						return t.success(initial);
					case 'Pending_':
						return e.progress.foldL(() => t.success(pending), p => t.success(progress(p)));
					case 'Success_':
						return t.success(success(e.value));
				}
			}
		},
		a =>
			a.foldL<JSONRemoteData_<OL, OR>>(
				() => ({ type: 'Initial_' }),
				progress => ({ type: 'Pending_', progress: JSONProgress.encode(progress) }),
				l => ({ type: 'Failure_', error: leftType.encode(l) }),
				a => ({ type: 'Success_', value: rightType.encode(a) }),
			),
		leftType,
		rightType,
	);
}
