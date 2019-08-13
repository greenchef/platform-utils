test('should export an object', () => {
	expect.assertions(1);
	const rosieUtils = require('../../rosie');
	expect(typeof rosieUtils).toBe('object');
});
