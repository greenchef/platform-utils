test('should export a Joi instance', () => {
	expect.assertions(2);
	const joi = require('../../initializers/joi');
	expect(joi.string).toBeDefined();
	expect(joi.validate).toBeDefined();
});
