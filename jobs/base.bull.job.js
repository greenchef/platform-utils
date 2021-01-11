const Queue = require('bull');
const merge = require('merge-deep');

const { joi: Joi, apm, log } = require('../initializers');

class BaseJob {
	constructor(queueName, concurrency = 1, overrideQueueOptions = {}) {
		if (!queueName) throw new Error('Queue name is required');
		this.queue = null;
		this.Joi = Joi;
		this.logger = log.gcLogger;
		this.queueName = queueName;
		this.concurrency = concurrency;
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
					type: 'exponential',
					delay: 30000,
				}
			},
			settings: {
				maxStalledCount: 0,
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
		this.logger.error(`work method for ${this.queueName} is not implemented`);
		done();
	}

	connect() {
		try {
			this.queue = this.queue || new Queue(this.queueName, this.queueOpts);
			this.logger.info(`${this.queueName} worker connected`);
		} catch (err) {
			this.logger.error(err);
		}
		this.startWorker();
	}

	disconnect() {
		try {
			if (this.queue) this.queue.close();
			this.logger.info(`${this.queueName} worker disconnected`);
		} catch (err) {
			this.logger.error(err);
		}
	}

	startWorker() {
		this.queue.process(this.concurrency, async (job, done) => {
			const apmTransaction = apm.startTransaction(this.constructor.name, 'job');
			const doneWrapper = (err) => {
				apmTransaction.result = err ? 'error' : 'success'
				apmTransaction.end();
				done(err);
			}
			this.work(job.data, job, doneWrapper, apmTransaction);
		});
		this.queue.resume(); // resume any paused queues when service restarts
		this.addListeners();
	}

	addListeners() {
		this.queue.on('stalled', (job) => {
			this.logger.error(`[${this.constructor.name}: Stalled], Job: ${JSON.stringify(job)}`);
		});

		this.queue.on('global:stalled', (job) => {
			this.logger.error(`[${this.constructor.name}: Global Stalled], Job: ${JSON.stringify(job)}`);
		});

		this.queue.on('failed', (job, error) => {
			this.logger.error(`[${this.constructor.name}: Failed] - ${error}, Job: ${JSON.stringify(job)}`);
			apm.captureError(error);
		});
		this.queue.on('global:failed', (job, error) => {
			this.logger.error(`[Base Bull Job: Global Failed] - ${error}, Job: ${JSON.stringify(job)}`);
			apm.captureError(error);
		});
		this.queue.on('error', (error) => {
			this.logger.error(`[${this.constructor.name}: Error] - ${error}`);
			apm.captureError(error);
		});
	}
}

module.exports = BaseJob;
