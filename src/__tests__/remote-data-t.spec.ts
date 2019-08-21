import { task } from 'fp-ts/lib/Task';
import { identity, constant } from 'fp-ts/lib/function';

import * as remoteDataT from '../remote-data-t';
import * as remoteData from '../remote-data';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from '../remote-data';

describe('RemoteDataT', () => {
	it('chain', async done => {
		const chain = remoteDataT.chain(task);
		const of = remoteDataT.getRemoteDataT(task).of;
		const f = (n: number) => of(n * 2);
		const x = of(1);
		const y = remoteDataT.fromRemoteData(task)<string, number>(remoteData.failure('foo'));

		const [e1, e2] = await Promise.all([chain(f, x)(), chain(f, y)()]);

		expect(e1).toEqual(remoteData.success(2));
		expect(e2).toEqual(remoteData.failure('foo'));
		done();
	});

	it('success', async done => {
		const success = remoteDataT.success(task);
		const rdTask = success(task.of(42));
		const rd = await rdTask();

		pipe(
			rd,
			fold(fail, fail, fail, (n: number) => expect(n).toEqual(42)),
		);
		done();
	});

	it('failure', async done => {
		const failure = remoteDataT.failure(task);
		const rdTask = failure(task.of(new Error('oops')));
		const rd = await rdTask();

		pipe(
			rd,
			fold(fail, fail, (e: Error) => expect(e.message).toEqual('oops'), fail),
		);
		done();
	});

	it('fromRemoteData', async done => {
		const fromRemoteData = remoteDataT.fromRemoteData(task);
		const rdTask = fromRemoteData(remoteData.success(42));
		const rd = await rdTask();

		pipe(
			rd,
			fold(fail, fail, fail, (n: number) => expect(n).toEqual(42)),
		);
		done();
	});

	it('fold', async done => {
		const fold = remoteDataT.fold(task);

		const rdTaskInitial = fold<string, Error, string>(
			'initial',
			'pending',
			(e: Error) => e.message,
			identity,
			task.of(remoteData.initial),
		);
		const rdTaskPending = fold<string, Error, string>(
			'initial',
			'pending',
			(e: Error) => e.message,
			identity,
			task.of(remoteData.pending),
		);
		const rdTaskFailure = fold<string, Error, string>(
			'initial',
			'pending',
			(e: Error) => e.message,
			identity,
			task.of(remoteData.failure(new Error('failure'))),
		);
		const rdTaskSuccess = fold<string, Error, string>(
			'initial',
			'pending',
			(e: Error) => e.message,
			identity,
			task.of(remoteData.success('success')),
		);

		const [i, p, f, s] = await Promise.all([rdTaskInitial(), rdTaskPending(), rdTaskFailure(), rdTaskSuccess()]);

		expect(i).toEqual('initial');
		expect(p).toEqual('pending');
		expect(f).toEqual('failure');
		expect(s).toEqual('success');

		done();
	});

	it('foldL', async done => {
		const foldL = remoteDataT.foldL(task);

		const rdTaskInitial = foldL<string, Error, string>(
			constant('initial'),
			constant('pending'),
			(e: Error) => e.message,
			identity,
			task.of(remoteData.initial),
		);
		const rdTaskPending = foldL<string, Error, string>(
			constant('initial'),
			constant('pending'),
			(e: Error) => e.message,
			identity,
			task.of(remoteData.pending),
		);
		const rdTaskFailure = foldL<string, Error, string>(
			constant('initial'),
			constant('pending'),
			(e: Error) => e.message,
			identity,
			task.of(remoteData.failure(new Error('failure'))),
		);
		const rdTaskSuccess = foldL<string, Error, string>(
			constant('initial'),
			constant('pending'),
			(e: Error) => e.message,
			identity,
			task.of(remoteData.success('success')),
		);

		const [i, p, f, s] = await Promise.all([rdTaskInitial(), rdTaskPending(), rdTaskFailure(), rdTaskSuccess()]);

		expect(i).toEqual('initial');
		expect(p).toEqual('pending');
		expect(f).toEqual('failure');
		expect(s).toEqual('success');

		done();
	});

	it('getRemoteDataT', () => {
		const getRemoteDataT = remoteDataT.getRemoteDataT(task);

		expect(getRemoteDataT.ap).toBeDefined();
		expect(getRemoteDataT.of).toBeDefined();
		expect(getRemoteDataT.map).toBeDefined();
		expect(getRemoteDataT.chain).toBeDefined();
	});
});
