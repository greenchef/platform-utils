const Joi = require('../initializers/joi');
const Queue = require('bull');
const apm = require('../initializers/elastic-apm');
const logger = require('../initializers/logger');

class BaseJob {
	constructor(queueName, concurrency = 1, overrideQueueOptions = {}) {
		if (!queueName) throw new Error('Queue name is required');
		this.queue = null;
		this.Joi = Joi;
		this.logger = logger;
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
					delay: 30000
				}
			}
		};
		this.queueOpts = { ...defaultQueueOptions, ...overrideQueueOptions};
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
		this.queue.on('failed', function(job, err){
			// A job failed with reason `err`!
			apm.captureError(err);
		})
		this.queue.on('error', function(err){
			// A job failed with reason `err`!
			apm.captureError(err);
		})
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

	}
}

module.exports = BaseJob;
