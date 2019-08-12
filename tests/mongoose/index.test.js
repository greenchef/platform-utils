test('should export an object', () => {
	expect.assertions(1);
	const mongooseUtils = require('../../mongoose');
	expect(typeof mongooseUtils).toBe('object');
});
