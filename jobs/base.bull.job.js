const Queue = require('bull');
const merge = require('merge-deep');

const { joi: Joi, apm, log } = require('../initializers');

class BaseJob {
	constructor(queueName, concurrency = 1, overrideQueueOptions = {}) {
		if (!queueName) throw new Error('Queue name is required');
		this.queue = null;
		this.Joi = Joi;
		this.logger = log.createLogger({ group: this.constructor.name, jobName: this.constructor.name, queueName });
		this.queueName = queueName;
		this.concurrency = concurrency;
		const lockDuration = overrideQueueOptions && overrideQueueOptions.settings && overrideQueueOptions.settings.lockDuration
			? overrideQueueOptions.settings.lockDuration
			: 60000;
		const defaultQueueOptions = {
			prefix: process.env.APP_CLUSTER || 'bull',
			redis: {
				db: parseInt(process.env.REDIS_BULL_DB) || 1,
				host: process.env.REDIS_HOST,
				port: 6379,
			},
			defaultJobOptions: {
				removeOnComplete: true,
				attempts: 1,
				backoff: {
					type: 'fixed',
					delay: 30000,
				}
			},
			settings: {
				lockDuration,
				lockRenewTime: Math.ceil(lockDuration / 4),
				maxStalledCount: 1,
				stalledInterval: 60000,
			}
		};
		this.queueOpts = merge(defaultQueueOptions, overrideQueueOptions);
	}

	validate() {
		return null;
	}

	async enqueue(data = {}, jobOptions = {}) {
		let job = null;
		try {
			this.validate(data);
			this.queue = this.queue || new Queue(this.queueName, this.queueOpts);
			job = await this.queue.add(data, jobOptions);
		} catch (err) {
			this.logger.error(err);
			throw err;
		}
		return job;
	}

	work(data, done) {
		this.logger.error('work method not implemented');
		done();
	}

	connect() {
		try {
			this.queue = this.queue || new Queue(this.queueName, this.queueOpts);
			this.logger.info('worker connected');
		} catch (err) {
			this.logger.error(err);
		}
		this.startWorker();
		return this.queue;
	}

	disconnect() {
		try {
			if (this.queue) this.queue.close();
			this.logger.info('worker disconnected');
		} catch (err) {
			this.logger.error(err);
		}
	}

	startWorker() {
		this.queue.process(this.concurrency, async (job, done) => {
			const apmTransaction = apm.startTransaction(this.constructor.name, 'job');
			const startTime = Date.now();

			this.logger = this.logger.child({ jobId: job.id, id: (job.data && job.data.id) });
			if (this.logger.debug()) {
				this.logger = this.logger.child({ data: job.data });
			}

			const doneWrapper = (err) => {
				apmTransaction.result = err ? 'error' : 'success'
				apmTransaction.end();
				const executionTime = Date.now() - startTime
				this.logger.debug(`${this.constructor.name} completed in ${executionTime} milliseconds`, { executionTime, attempt: job.attemptsMade, startTime })
				done(err);
			}

			this.work(job.data, job, doneWrapper, apmTransaction);
		});
		this.queue.resume(); // resume any paused queues when service restarts
		this.addListeners();
	}

	addListeners() {
		this.queue.on('stalled', (job) => {
			this.logger.error('Stalled', { event: 'stalled', job });
			apm.captureError({ message: `${this.constructor.name} stalled`, job });
		});

		this.queue.on('failed', (job, error) => {
			this.logger.error(error, { event: 'failed', job });
			apm.captureError({ error, job });
		});

		this.queue.on('error', (error) => {
			this.logger.error(error, { event: 'error' });
			apm.captureError(error);
		});
	}
}

module.exports = BaseJob;
