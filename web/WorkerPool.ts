import { Remote, wrap } from "comlink";

export type WorkerFactory = () => Worker;

export type RemoteTask<T, R> = (remote: Remote<T>) => Promise<R>;

export type TaskFn<T, A, R> = (remote: Remote<T>, args: A) => Promise<R>;

export class WorkerPool<T> {

	private readonly workers: Worker[] = [];
	private readonly remotes: Remote<T>[] = [];

	constructor(createWorker: WorkerFactory, count: number) {
		this.workers = new Array(count);
		this.remotes = new Array(count);

		for (let i = 0; i < count; i++) {
			const worker = createWorker();
			this.workers[i] = worker;
			this.remotes[i] = wrap<T>(worker);
		}
	}

	get count() {
		return this.workers.length;
	}

	/**
	 * Run a function with each worker.
	 *
	 * @param fn Function
	 */
	runOnEach<R>(fn: RemoteTask<T, R>) {
		return Promise.all(this.remotes.map(fn));
	}

	async all<A, R>(args: A[], fn: TaskFn<T, A, R>) {
		const returnValues = new Array(args.length);
		let index = 0;

		const allTasks = this.runOnEach(async remote => {
			while (index < args.length) {
				const i = index++;
				returnValues[i] = await fn(remote, args[i]);
			}
		});

		return allTasks.then(() => returnValues);
	}

	terminate() {
		this.workers.forEach(worker => worker.terminate());
	}
}
