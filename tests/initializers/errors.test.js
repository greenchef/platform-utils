test('should export an object', () => {
	expect.assertions(1);
	const errors = require('../../initializers/errors');
	expect(typeof errors).toBe('object');
});
