// NOTE: This relies on dotenv being passed to process and convict called in the jest setup
test('should add to `process.convict` from .env + convict', () => {
	expect.assertions(1);
	expect(process.convict.get('mongoDb.name')).toBeDefined();
});
