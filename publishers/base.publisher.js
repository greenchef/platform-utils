// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set region
AWS.config.update({ region: 'us-west-2' });
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', endpoint: process.env.SNS_ENDPOINT });

const { joi: Joi, log } = require('../initializers');

class BasePublisher {
	constructor(topic, schema) {
		if (!topic) throw new Error('Topic name is required');
		this.logger = log.createLogger({ group: this.constructor.name, publisherName: this.constructor.name });
		this.ready = false;
		this.schema = schema;
		this.topic = process.env.APP_CLUSTER ? `${process.env.APP_CLUSTER}-${topic}` : `local-${topic}`;
		this.topicArn = null;
	}

	validate(data) {
		if (!this.schema) return data;
		const { error, value } = Joi.validate(data, this.schema);
		if (error) throw error;
		return value;
	}

	getTopic() {
		return this.topic;
	}

	async publish(data = {}) {
		// extra parsing and stringify to account for nested mongo object id's and other oddities
		const message = JSON.stringify(this.validate(JSON.parse(JSON.stringify(data))));

		// Create publish parameters
		try {
			const params = {
				Message: message, /* required */
				TopicArn: this.topicArn,
			};
			// Create promise and SNS service object
			const publisher = SNS.publish(params).promise();
			const snsResponse = await publisher;
			return snsResponse;
		} catch (err) {
			this.logger.error(err, { supplementalMessage: `Error publishing message for topic ${this.topic}` });
			throw err;
		}
	}

	async connect() {
		try {
			const snsCreateResponse = await SNS.createTopic({ Name: this.topic }).promise();
			this.topicArn = snsCreateResponse.TopicArn;
		} catch (err) {
			this.logger.error(err, { supplementalMessage: `Error creating topic ${this.topic}` });
			throw err;
		}
	}
}

module.exports = BasePublisher;
