const initializers = require('../../initializers');

test('should export an object', () => {
	expect.assertions(1);
	expect(typeof initializers).toBe('object');
});

test('exported object should not contain arena-auth as it is an optional initializer', () => {
	expect.assertions(1);
	expect(initializers.arenaAuth).toBeUndefined();
});
