const Joi = require('../../initializers/joi');
const joiUtils = require('../../joi');

describe('joiUtils', () => {
	test('should export an object', () => {
		expect.assertions(1);
		expect(typeof joiUtils).toBe('object');
	});

	describe('joiDollarString', () => {
		test('returns a Joi schema', () => {
			const schema = joiUtils.joiDollarString();
			expect(schema.isJoi).toBe(true);
		});
		test('error is thrown if schema is tested against invalid values', () => {
			const schema = joiUtils.joiDollarString();
			// numbers
			expect(() => Joi.assert(678, schema)).toThrow();
			expect(() => Joi.assert(123.00, schema)).toThrow();
			expect(() => Joi.assert(0.05, schema)).toThrow();
			expect(() => Joi.assert(0, schema)).toThrow();
			// string without digits
			expect(() => Joi.assert('asdf', schema)).toThrow();
			// no $, or in the wrong place
			expect(() => Joi.assert('45.67', schema)).toThrow();
			expect(() => Joi.assert('4$5.67', schema)).toThrow();
			expect(() => Joi.assert('45.67$', schema)).toThrow();
			// no . or wrong character used
			expect(() => Joi.assert('45,67', schema)).toThrow();
			expect(() => Joi.assert('45 67', schema)).toThrow();
			expect(() => Joi.assert('4567', schema)).toThrow();
			// comma groupings wrong
			expect(() => Joi.assert('$4567.00', schema)).toThrow();
			expect(() => Joi.assert('$45,67.00', schema)).toThrow();
			expect(() => Joi.assert('$456,7.00', schema)).toThrow();
			// wrong number of digits before/after .
			expect(() => Joi.assert('$.01', schema)).toThrow();
			expect(() => Joi.assert('$7.5', schema)).toThrow();
		});
		test('no error is thrown if schema is tested against a properly formatted string', () => {
			const schema = joiUtils.joiDollarString();
			expect(() => Joi.assert('$7.55', schema)).not.toThrow();
			expect(() => Joi.assert('$3,456.01', schema)).not.toThrow();
			expect(() => Joi.assert('$73,834.48', schema)).not.toThrow();
			expect(() => Joi.assert('$1,000,000,000.00', schema)).not.toThrow();
			expect(() => Joi.assert('$0.00', schema)).not.toThrow();
		});
  });
  
  describe('joiStateAbbreviation', () => {
    test('returns a Joi schema', () => {
			const schema = joiUtils.joiStateAbbreviation();
			expect(schema.isJoi).toBe(true);
    });
    test('error is thrown if schema is tested against invalid values', () => {
			const schema = joiUtils.joiStateAbbreviation();
			expect(() => Joi.assert("CM", schema)).toThrow();
			expect(() => Joi.assert("PR", schema)).toThrow();
      expect(() => Joi.assert("QQ", schema)).toThrow();
      expect(() => Joi.assert("ny", schema)).toThrow();
			expect(() => Joi.assert("Alabama", schema)).toThrow();
			expect(() => Joi.assert("", schema)).toThrow();
      expect(() => Joi.assert(12, schema)).toThrow();
      expect(() => Joi.assert([], schema)).toThrow();
    });
    test('error is not thrown if schema is tested against valid values', () => {
			const schema = joiUtils.joiStateAbbreviation();
			expect(() => Joi.assert("CO", schema)).not.toThrow();
			expect(() => Joi.assert("AL", schema)).not.toThrow();
			expect(() => Joi.assert("KS", schema)).not.toThrow();
			expect(() => Joi.assert("NY", schema)).not.toThrow();
			expect(() => Joi.assert("OR", schema)).not.toThrow();
		});
  })
});
