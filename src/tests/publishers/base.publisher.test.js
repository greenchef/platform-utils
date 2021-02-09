const AWS = require('aws-sdk');
const Joi = require('joi')
const joiUtils = require('../../joi')

const mockPublish = jest.fn(() => { return { promise: () => { return 'ok' } } });
AWS.SNS = jest.fn().mockImplementation(() => ({
	publish: mockPublish,
}));

describe('Base Publisher', () => {
	let publisher;
	let Base = null;
  beforeAll(() => {
		Base = require('../../publishers/base.publisher')
		const schema = Joi.object().keys({
			user: joiUtils.joiMongoId().required(),
			couponTypeAtLeadCreation: joiUtils.joiMongoId().required(),
			utmParametersAtLeadCreation: Joi.object({
				utm_source: Joi.string(),
				utm_medium: Joi.string(),
				utm_term: Joi.string(),
				utm_content: Joi.string(),
				utm_campaign: Joi.string(),
			}),
			createdAt: Joi.date().required(),
		}).options({ stripUnknown: true });

		publisher = new Base('test', schema)
  })
  describe('validation', () => {
    test('should pass with all fields', async () => {

      expect(() => {
        const payload = {
          user: '5a4faef1f9218ca32da1dc3f',
          couponTypeAtLeadCreation: '5a4faef1f9218ca32da1dc3f',
          utmParametersAtLeadCreation: {
            utm_source: 'a',
            utm_medium: 'b',
            utm_term: 'c',
            utm_content: 'd',
            utm_campaign: 'e',
          },
          createdAt: new Date(),
        }
        const returnedValue = publisher.validate(payload).not.toThrow();
        expect(returnedValue).toEqual(payload);
      });
    })

    test('should pass with missing optional field', async () => {
      expect(() => {
        publisher.validate({
          user: '5a4faef1f9218ca32da1dc3f',
          couponTypeAtLeadCreation: '5a4faef1f9218ca32da1dc3f',
          createdAt: new Date(),
        });
      }).not.toThrow();
    });

    test('should fail with missing required field', async () => {
      expect(() => {
        publisher.validate({
          user: '5a4faef1f9218ca32da1dc3f',
          createdAt: new Date(),
        });
      }).toThrow();
    });
  })

  describe('publishing', () => {
    test('should publish a message', async () => {
      const snsResponse = await publisher.publish({
        user: '5a4faef1f9218ca32da1dc3f',
        couponTypeAtLeadCreation: '5a4faef1f9218ca32da1dc3f',
        utmParametersAtLeadCreation: {
          utm_source: 'a',
          utm_medium: 'b',
          utm_term: 'c',
          utm_content: 'd',
          utm_campaign: 'e',
        },
        createdAt: new Date(),
      });
      expect(snsResponse).toBeDefined();
    });
  })
})


