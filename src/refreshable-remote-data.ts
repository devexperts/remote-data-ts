import { pipe } from 'fp-ts/lib/pipeable';
import { failure, fold, initial, isFailure, isInitial, isSuccess, RemoteData, success } from './remote-data';

/**
 * When refreshing a resource it can be desirable to do so silently in the background while keeping
 * the previously fetched value around until the new value is ready.
 *
 * The {@link RefreshableRemoteData} type can express this by using a tuple of {@link RemoteData}
 * types, where
 *
 * 1. The first value represents the cached (stale) value that represents the latest loaded data
 * 2. The second value represents the background request that will refresh (revalidate) the cache
 */
export type RefreshableRemoteData<E, A> = [
	RemoteData<E, A> /** Current state (cache) */,
	RemoteData<E, A> /** Next state (revalidation request) */,
];

/**
 * Given a {@link RefreshableRemoteData}, the stale-while-revalidate refresh strategy will
 *
 * - return an initial or pending value as long as no data has been fetched
 * - keep returning a success value until it is replaced by another success or failure value
 * - keep returning a failure value only as long as it is not being refreshed, in which case
 *   it will fall back to a pending value
 *
 * @see {@link staleIfError}
 */
export function staleWhileRevalidate<E, A>([current, next]: RefreshableRemoteData<E, A>): RefreshableRemoteData<E, A> {
	return pipe(
		next,
		fold(
			() => [current, next],
			() => [isInitial(current) || isFailure(current) ? next : current, next],
			e => [failure(e), initial],
			x => [success(x), initial],
		),
	);
}

/**
 * Given a {@link RefreshableRemoteData}, the stale-if-error refresh strategy will
 *
 * - return an initial or pending value as long as no data has been fetched
 * - return a failure only if no data has been previously fetched; newer failures replace older ones
 * - keep returning the cached success value indefinitely unless it is replaced by another success value
 *
 * @see {@link staleWhileRevalidate}
 */
export function staleIfError<E, A>([current, next]: RefreshableRemoteData<E, A>): RefreshableRemoteData<E, A> {
	return pipe(
		next,
		fold(
			() => [current, next],
			() => [isInitial(current) ? next : current, next],
			e => [isSuccess(current) ? current : failure(e), initial],
			x => [success(x), initial],
		),
	);
}
