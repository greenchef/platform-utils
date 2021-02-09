// NOTE: This relies on dotenv being called in the jest setup
test('should add to `process.env` from .env', () => {
	expect.assertions(1);
	expect(process.env.MONGODB_NAME).toBeDefined();
});
