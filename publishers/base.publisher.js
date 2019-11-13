const Joi = require('gc-platform-utils/initializers/joi');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set region
AWS.config.update({ region: 'us-west-2' });
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', endpoint: process.env.SNS_ENDPOINT });

const logger = require('../initializers/logger');

class BasePublisher {
  constructor(topic, schema) {
    if (!topic) throw new Error('Topic name is required');
    this.logger = logger;
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
    const message = JSON.stringify(this.validate(data));

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
      logger.error(`Error publishing message for topic ${this.topic}: Error: ${err}`);
      throw err;
    }
  }

  async connect() {
    try {
      const snsCreateResponse = await SNS.createTopic({ Name: this.topic }).promise();
      this.topicArn = snsCreateResponse.TopicArn;
      return
    } catch (err) {
      logger.error(`Error creating topic ${this.topic}: Error: ${err}`);
      throw err;
    }
  }
}

module.exports = BasePublisher;
