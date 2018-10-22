import { createRemoteDataFromJSON } from '../io-ts';
import * as t from 'io-ts';
import { initial, pending, failure, success, progress } from '../remote-data';
import { right } from 'fp-ts/lib/Either';
import { none, some } from 'fp-ts/lib/Option';

describe('RemoteDataFromJSONType', () => {
	it('createRemoteDataFromJSON', () => {
		const T = createRemoteDataFromJSON(t.string, t.number);
		expect(T.decode({ type: 'Failure', error: 'error' })).toEqual(right(failure('error')));
		expect(T.decode({ type: 'Initial' })).toEqual(right(initial));
		expect(T.decode({ type: 'Pending', progress: null })).toEqual(right(pending));
		expect(T.decode({ type: 'Pending', progress: { loaded: 2, total: null } })).toEqual(
			right(progress({ loaded: 2, total: none })),
		);
		expect(T.decode({ type: 'Pending', progress: { loaded: 2, total: 5 } })).toEqual(
			right(progress({ loaded: 2, total: some(5) })),
		);
		expect(T.decode({ type: 'Success', value: 42 })).toEqual(right(success(42)));
		expect(T.encode(failure('error'))).toEqual({ type: 'Failure', error: 'error' });
		expect(T.encode(initial)).toEqual({ type: 'Initial' });
		expect(T.encode(pending)).toEqual({ type: 'Pending', progress: null });
		expect(T.encode(progress({ loaded: 2, total: none }))).toEqual({
			type: 'Pending',
			progress: { loaded: 2, total: null },
		});
		expect(T.encode(progress({ loaded: 2, total: some(5) }))).toEqual({
			type: 'Pending',
			progress: { loaded: 2, total: 5 },
		});
		expect(T.encode(success(42))).toEqual({ type: 'Success', value: 42 });
		expect(T.is(failure('error'))).toBe(true);
		expect(T.is(initial)).toBe(true);
		expect(T.is(pending)).toBe(true);
		expect(T.is(success(42))).toBe(true);
		expect(T.is(failure(1))).toBe(false);
		expect(T.is(success('invalid'))).toBe(false);
	});
});
