describe('getMongoConnectionString', () => {
	test('should use MONGODB_URI env var if available', () => {
		expect.assertions(1);
		const initUtils = require('../../initializers/utils');
		const uri = 'not actually a uri';
		process.env.MONGODB_URI = uri;
		expect(initUtils.getMongoConnectionString().startsWith(uri)).toBe(true);
	});

	test('should fall back to MONGO_URI env var', () => {
		expect.assertions(1);
		const initUtils = require('../../initializers/utils');
		const uri = 'test uri';
		delete process.env.MONGODB_URI;
		process.env.MONGO_URI = uri;
		expect(initUtils.getMongoConnectionString()).toBe(uri);
	});
});
