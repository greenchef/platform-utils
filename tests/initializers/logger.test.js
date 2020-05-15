test('should export a bunyan logger', () => {
	expect.assertions(1);
	const log = require('../../initializers/logger');
	expect(log.logger).toBeInstanceOf(require('bunyan'));
});
