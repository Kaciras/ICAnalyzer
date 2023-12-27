import { RPC } from "@kaciras/utilities/browser";

export type WorkerFactory = () => Worker;

export type TaskFn<T, R> = (remote: RPC.Remote<T>) => Promise<R>;

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

	private readonly factory: WorkerFactory;
	private readonly workers: Array<Worker | undefined>;

	private readonly remotes: Array<RPC.Remote<T>> = [];
	private readonly queue: Array<WorkerJob<T>> = [];

	private readonly waiters: PromiseController[] = [];

	private size = 0;

	terminated = false;

	constructor(factory: WorkerFactory, maxSize: number) {
		if (maxSize < 1) {
			throw new Error("Worker count must be at least 1");
		}
		this.factory = factory;
		this.workers = new Array(maxSize);
	}

	/**
	 * Execute a function with each worker, call this method will start all workers.
	 *
	 * @param action the Function to execute.
	 */
	runOnEach<R>(action: TaskFn<T, R>) {
		const { workers, remotes } = this;
		const max = workers.length;

		while (this.size < max) {
			this.startWorker();
		}
		return Promise.all(remotes.map(action));
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
		this.workers.forEach(worker => worker?.terminate());
	}

	private get allWorkerAreFree() {
		return this.remotes.length === this.size;
	}

	private startWorker() {
		const worker = this.factory();
		const remote = RPC.probeClient(worker);

		const index = this.size++;
		this.remotes.push(remote);
		this.workers[index] = worker;
	}

	private addJob(job: WorkerJob<T>) {
		const { workers, remotes, size } = this;
		if (remotes.length === 0 && size < workers.length) {
			this.startWorker();
		}
		const remote = remotes.pop();
		if (!remote) {
			this.queue.push(job);
		} else {
			return this.runJob(remote, job);
		}
	}

	private async runJob(remote: RPC.Remote<T>, job: WorkerJob<T>): Promise<void> {
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
