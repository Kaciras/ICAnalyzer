import { Remote, wrap } from "comlink";

export type WorkerFactory = () => Worker;

export type TaskFn<T, R> = (remote: Remote<T>) => Promise<R>;

interface WorkerJob<T> {
	task: TaskFn<T, any>;
	resolve: (value: any) => void;
}

// Is a worker pool necessary? Multiple consumer cycles can also works.
export default class WorkerPool<T> {

	terminated = false;

	private readonly queue: WorkerJob<T>[] = [];

	private readonly waiters: Array<() => void> = [];

	// Track workers for terminate
	private readonly workers: Worker[];

	private readonly remotes: Remote<T>[];

	constructor(factory: WorkerFactory, size: number) {
		if (size < 1) {
			throw new Error("Worker count must be at least 1");
		}
		this.workers = new Array(size);
		this.remotes = new Array(size);

		for (let i = 0; i < size; i++) {
			const worker = factory();
			this.workers[i] = worker;
			this.remotes[i] = wrap<T>(worker);
		}
	}

	/**
	 * Run a function with each worker.
	 *
	 * @param fn Function
	 */
	runOnEach<R>(fn: TaskFn<T, R>) {
		return Promise.all(this.remotes.map(fn));
	}

	run<R>(task: TaskFn<T, R>) {
		return new Promise<R>(resolve => this.addJob({ task, resolve }));
	}

	join() {
		const { queue, remotes, workers, waiters } = this;
		if (queue.length === 0 && remotes.length === workers.length) {
			return Promise.resolve();
		}
		return new Promise<void>(resolve => waiters.push(resolve));
	}

	terminate() {
		this.terminated = true;
		this.workers.forEach(worker => worker.terminate());
		this.waiters.forEach(resolve => resolve());
	}

	private addJob(job: WorkerJob<T>) {
		const remote = this.remotes.pop();
		if (!remote) {
			this.queue.push(job);
		} else {
			return this.runJob(remote, job);
		}
	}

	private async runJob(remote: Remote<T>, job: WorkerJob<T>): Promise<void> {
		const { task, resolve } = job;
		resolve(await task(remote));

		const next = this.queue.pop();
		if (next) {
			return this.runJob(remote, next);
		}

		const { remotes, workers, waiters } = this;
		remotes.push(remote);
		if (remotes.length === workers.length) {
			waiters.splice(0, waiters.length).forEach(resolve => resolve());
		}
	}
}
