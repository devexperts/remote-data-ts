import { fold } from 'fp-ts/lib/Either';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export function run<A>(eff: TaskEither<Error, A>): void {
	eff()
		.then(
			fold(
				e => {
					throw e;
				},
				_ => {
					process.exitCode = 0;
				},
			),
		)
		.catch(e => {
			console.error(e); // tslint:disable-line no-console

			process.exitCode = 1;
		});
}
