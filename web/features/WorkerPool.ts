import { Remote, wrap } from "comlink";

export type WorkerFactory = () => Worker;

export type TaskFn<T, R> = (remote: Remote<T>) => Promise<R>;

interface PromiseController {
	resolve: () => void;
	reject: (reason: any) => void;
}

interface WorkerJob<T> {
	task: TaskFn<T, any>;
	resolve: (value: any) => void;
	reject: (reason: any) => void;
}

/**
 * Executes each submitted task using one of possibly several pooled workers.
 *
 * The pool uses single task queue that may cause dead lock if schedule and wait a new task inside another.
 */
export default class WorkerPool<T> {

	private readonly workers: Worker[];
	private readonly remotes: Array<Remote<T>>;

	private readonly waiters: PromiseController[] = [];

	private readonly queue: Array<WorkerJob<T>> = [];

	terminated = false;

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
	 * Execute a function with each worker.
	 *
	 * @param fn Function
	 */
	runOnEach<R>(fn: TaskFn<T, R>) {
		return Promise.all(this.remotes.map(fn));
	}

	run<R>(task: TaskFn<T, R>) {
		return new Promise<R>((resolve, reject) => this.addJob({ task, resolve, reject }));
	}

	/**
	 * Wait task queue for empty or an error occurred in tasks.
	 */
	join() {
		const { queue, waiters } = this;
		if (queue.length === 0 && this.allWorkerAreFree) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => waiters.push({ resolve, reject }));
	}

	terminate() {
		this.terminated = true;
		this.workers.forEach(worker => worker.terminate());
	}

	private get allWorkerAreFree() {
		return this.remotes.length === this.workers.length;
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
		const { queue, remotes, waiters } = this;
		const { task, resolve, reject } = job;

		try {
			resolve(await task(remote));
		} catch (e) {
			reject(e);
			waiters.splice(0, waiters.length).forEach(p => p.reject(e));
		}

		const next = queue.pop();
		if (next) {
			return this.runJob(remote, next);
		}

		remotes.push(remote);

		if (this.allWorkerAreFree) {
			waiters.splice(0, waiters.length).forEach(p => p.resolve());
		}
	}
}
