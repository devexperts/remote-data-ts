import { failure, getShow, initial, pending, success as successRD } from '../remote-data';
import { RefreshableRemoteData, staleIfError, staleWhileRevalidate } from '../refreshable-remote-data';
import { fst, snd } from 'fp-ts/lib/Tuple';
import { showString } from 'fp-ts/lib/Show';
import { flow } from 'fp-ts/lib/function';
const show = flow(getShow(showString, showString).show);

type TestRRD = RefreshableRemoteData<string, string>;
type TestMatrix = Array<[TestRRD, TestRRD]>;

describe('RemoteData', () => {
	const failcur = failure('Current failure');
	const failnxt = failure('Next failure');
	const succcur = successRD('Current success');
	const succnxt = successRD('Next success');

	describe('Strategy: staleWhileRevalidate', () => {
		const matrix: TestMatrix = [
			[[initial, initial], [initial, initial]],
			[[initial, pending], [pending, pending]],
			[[initial, failnxt], [failnxt, initial]],
			[[initial, succnxt], [succnxt, initial]],

			[[pending, initial], [pending, initial]],
			[[pending, pending], [pending, pending]],
			[[pending, failnxt], [failnxt, initial]],
			[[pending, succnxt], [succnxt, initial]],

			[[failcur, initial], [failcur, initial]],
			[[failcur, pending], [pending, pending]],
			[[failcur, failnxt], [failnxt, initial]],
			[[failcur, succnxt], [succnxt, initial]],

			[[succcur, initial], [succcur, initial]],
			[[succcur, pending], [succcur, pending]],
			[[succcur, failnxt], [failnxt, initial]],
			[[succcur, succnxt], [succnxt, initial]],
		];

		matrix.forEach(([input, expected]) => {
			it(formatTestName(input, expected), () => {
				expect(staleWhileRevalidate(input)).toStrictEqual(expected);
			});
		});
	});

	describe('Strategy: staleIfError', () => {
		const matrix: TestMatrix = [
			[[initial, initial], [initial, initial]],
			[[initial, pending], [pending, pending]],
			[[initial, failnxt], [failnxt, initial]],
			[[initial, succnxt], [succnxt, initial]],

			[[pending, initial], [pending, initial]],
			[[pending, pending], [pending, pending]],
			[[pending, failnxt], [failnxt, initial]],
			[[pending, succnxt], [succnxt, initial]],

			[[failcur, initial], [failcur, initial]],
			[[failcur, pending], [failcur, pending]],
			[[failcur, failnxt], [failnxt, initial]],
			[[failcur, succnxt], [succnxt, initial]],

			[[succcur, initial], [succcur, initial]],
			[[succcur, pending], [succcur, pending]],
			[[succcur, failnxt], [succcur, initial]],
			[[succcur, succnxt], [succnxt, initial]],
		];

		matrix.forEach(([input, expected]) => {
			it(formatTestName(input, expected), () => {
				expect(staleIfError(input)).toStrictEqual(expected);
			});
		});
	});
});

function formatTestName(input: TestRRD, expected: TestRRD) {
	return `[${show(fst(input))}, ${show(snd(input))}] -> [${show(fst(expected))}, ${show(snd(expected))}]`;
}
