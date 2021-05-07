const BaseJob = require('../../jobs/base.bull.job');

describe('BaseHandler', () => {
	beforeAll(() => {
	})
	describe('settings check', () => {
		test('should have default setting values', () => {
			const baseJob = new BaseJob('test');
			expect(baseJob.queueOpts.settings.lockDuration).toEqual(60000);
			expect(baseJob.queueOpts.settings.lockRenewTime).toEqual(60000 / 4);
			expect(baseJob.queueOpts.settings.maxStalledCount).toEqual(1);
			expect(baseJob.queueOpts.settings.stalledInterval).toEqual(60000);

			expect(baseJob.queueOpts.defaultJobOptions.attempts).toEqual(1);
			expect(baseJob.queueOpts.defaultJobOptions.removeOnComplete).toEqual(true);
			expect(baseJob.queueOpts.defaultJobOptions.backoff.type).toEqual('fixed');
		});

		test('should have set setting values', () => {
			const baseJob = new BaseJob('test', 3, { defaultJobOptions: { attempts: 3 }, settings: { lockDuration: 10000, maxStalledCount: 3, stalledInterval: 3000 } });
			expect(baseJob.queueOpts.settings.lockDuration).toEqual(10000);
			expect(baseJob.queueOpts.settings.lockRenewTime).toEqual(Math.ceil(10000 / 4));
			expect(baseJob.queueOpts.settings.maxStalledCount).toEqual(3);
			expect(baseJob.queueOpts.settings.stalledInterval).toEqual(3000);

			expect(baseJob.queueOpts.defaultJobOptions.attempts).toEqual(3);
		});

		test('should have set an override lockRenewTime value', () => {
			const baseJob = new BaseJob('test', 3, { settings: { maxStalledCount: 3, stalledInterval: 3000, lockRenewTime: 5000 } });
			expect(baseJob.queueOpts.settings.lockDuration).toEqual(60000);
			expect(baseJob.queueOpts.settings.lockRenewTime).toEqual(5000);
			expect(baseJob.queueOpts.settings.maxStalledCount).toEqual(3);
			expect(baseJob.queueOpts.settings.stalledInterval).toEqual(3000);
		});
	});
});
