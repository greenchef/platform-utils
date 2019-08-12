test('should export an object', () => {
	expect.assertions(1);
	const joiUtils = require('../../joi');
	expect(typeof joiUtils).toBe('object');
});
