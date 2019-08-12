test('should export an object', () => {
	expect.assertions(1);
	const initializers = require('../../initializers');
	expect(typeof initializers).toBe('object');
});
