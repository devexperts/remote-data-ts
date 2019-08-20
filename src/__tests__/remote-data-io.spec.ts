import { createRemoteDataFromJSON } from '../remote-data-io';
import { initial, pending, failure, success, progress } from '../remote-data';
import { right } from 'fp-ts/lib/Either';
import { none, some } from 'fp-ts/lib/Option';
import { number, string } from 'io-ts';

describe('RemoteDataFromJSONType', () => {
	it('createRemoteDataFromJSON', () => {
		const codec = createRemoteDataFromJSON(string, number);
		expect(codec.decode({ _tag: 'RemoteFailure', error: 'error' })).toEqual(right(failure('error')));
		expect(codec.decode({ _tag: 'RemoteInitial' })).toEqual(right(initial));
		expect(codec.decode({ _tag: 'RemotePending', progress: null })).toEqual(right(pending));
		expect(codec.decode({ _tag: 'RemotePending', progress: { loaded: 2, total: null } })).toEqual(
			right(progress({ loaded: 2, total: none })),
		);
		expect(codec.decode({ _tag: 'RemotePending', progress: { loaded: 2, total: 5 } })).toEqual(
			right(progress({ loaded: 2, total: some(5) })),
		);
		expect(codec.decode({ _tag: 'RemoteSuccess', value: 42 })).toEqual(right(success(42)));
		expect(codec.encode(failure('error'))).toEqual({ _tag: 'RemoteFailure', error: 'error' });
		expect(codec.encode(initial)).toEqual({ _tag: 'RemoteInitial' });
		expect(codec.encode(pending)).toEqual({ _tag: 'RemotePending', progress: null });
		expect(codec.encode(progress({ loaded: 2, total: none }))).toEqual({
			_tag: 'RemotePending',
			progress: { loaded: 2, total: null },
		});
		expect(codec.encode(progress({ loaded: 2, total: some(5) }))).toEqual({
			_tag: 'RemotePending',
			progress: { loaded: 2, total: 5 },
		});
		expect(codec.encode(success(42))).toEqual({ _tag: 'RemoteSuccess', value: 42 });
		expect(codec.is(failure('error'))).toBe(true);
		expect(codec.is(initial)).toBe(true);
		expect(codec.is(pending)).toBe(true);
		expect(codec.is(success(42))).toBe(true);
		expect(codec.is(failure(1))).toBe(false);
		expect(codec.is(success('invalid'))).toBe(false);
	});
});
