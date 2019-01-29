import { task } from 'fp-ts/lib/Task';

import * as remoteDataT from '../remote-data-t';
import * as remoteData from '../remote-data';

describe('RemoteDataT', () => {
	it('chain', async done => {
		const chain = remoteDataT.chain(task);
		const of = remoteDataT.getRemoteDataT(task).of;
		const f = (n: number) => of(n * 2);
		const x = of(1);
		const y = remoteDataT.fromRemoteData(task)<string, number>(remoteData.failure('foo'));

		const [e1, e2] = await Promise.all([chain(f, x).run(), chain(f, y).run()]);

		expect(e1).toEqual(remoteData.success(2));
		expect(e2).toEqual(remoteData.failure('foo'));
		done();
	});
});
