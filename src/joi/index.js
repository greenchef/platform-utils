const Boom = require('boom');
const Joi = require('../initializers/joi');

// string for a dollar amount, ex. $45.87, $25,068.99
const joiDollarString = () => Joi.string().regex(/^\$\d{1,3}(,\d{3})*\.\d{2}$/);

// joi mongo id checking.
const joiMongoId = () => {
	return Joi.string().regex(/^[a-f\d]{24}$/i);
};

// A date string with time and time zone: YYYY-MM-DD h:mm A z
const joiDateTime = () => {
	return Joi.string().regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]) ([1-9]|1[012]):[0-5][0-9] (AM|PM) ([ECMP][DS]T)$/);
};

// A yyyy-dd-mm date string
const joiSimpleDate = () => {
	return Joi.string().regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
};

const joiStateAbbreviation = () => {
	return Joi.string().regex(
		/^(?:A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|P[A]|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$/
	)
};

const joiZipCode = () => {
	return Joi.string().regex(/^\d{5}(-\d{4})?$/);
};

const validate = (toValidate, schema) => {
	const { error, value } = Joi.validate(toValidate, schema);
	if (error) throw Boom.badRequest(error.details[0].message, error.details[0]);
	return value;
};

const defaultSearchSchema = {
	limit: Joi.number().min(0),
	populate: Joi.string(),
	projection: Joi.string(),
	skip: Joi.number().min(0),
	sortOrder: Joi.number().valid(1, -1),
	sortProperty: Joi.string(),
};

module.exports = {
	defaultSearchSchema,
	joiDateTime,
	joiDollarString,
	joiMongoId,
	joiSimpleDate,
	joiStateAbbreviation,
	joiZipCode,
	validate,
};
