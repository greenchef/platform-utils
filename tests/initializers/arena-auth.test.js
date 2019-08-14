test('should export a function', () => {
	expect.assertions(1);
	const arenaAuth = require('../../initializers/arena-auth');
	expect(typeof arenaAuth).toBe('function');
});
