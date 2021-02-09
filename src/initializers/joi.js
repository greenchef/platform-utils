const Joi = require('joi');

module.exports = Joi.defaults(schema => {
	return schema.options({ stripUnknown: { arrays: false, objects: true } });
});
