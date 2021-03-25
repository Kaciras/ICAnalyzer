import { Remote, wrap } from "comlink";

export type WorkerFactory = () => Worker;

export type TaskFn<T, R> = (remote: Remote<T>) => Promise<R>;

interface WorkerJob<T> {
	task: TaskFn<T, any>;
	resolve: (value: any) => void;
}

export class WorkerPool<T> {

	private readonly queue: WorkerJob<T>[] = [];

	// Track workers for terminate
	private readonly workers: Worker[] = [];

	private readonly remotes: Remote<T>[] = [];

	constructor(factory: WorkerFactory, count: number) {
		if (count < 1) {
			throw new Error("Worker count must be at least 1");
		}
		this.workers = new Array(count);
		this.remotes = new Array(count);

		for (let i = 0; i < count; i++) {
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

	private addJob(job: WorkerJob<T>) {
		const remote = this.remotes.pop();
		if (!remote) {
			this.queue.push(job);
		} else {
			return this.runJob(remote, job);
		}
	}

	private async runJob(remote: Remote<T>, job: WorkerJob<T>) {
		const { task, resolve } = job;
		resolve(await task(remote));

		const next = this.queue.pop();
		if (!next) {
			this.remotes.push(remote);
		} else {
			await this.runJob(remote, next);
		}
	}

	terminate() {
		this.workers.forEach(worker => worker.terminate());
	}
}
