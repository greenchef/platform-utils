const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

AWS.config.update({ region: 'us-west-2' });
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', endpoint: process.env.SNS_ENDPOINT });
const SQS = new AWS.SQS({ apiVersion: '2012-11-05', endpoint: process.env.SQS_ENDPOINT });

const { log } = require('../initializers');

const handlers = {};
const logger = log.gcLogger;

class BaseConsumer {
  static async run(queueUrl, options = {}) {
    const consumer = Consumer.create({
      batchSize: options.batchSize || 1,
      queueUrl,
      handleMessage: async (notification) => {
        try {
          if (notification && notification.Body) {
            const message = JSON.parse(notification.Body);
            const parts = message.TopicArn.split(':');
            const { Timestamp: publishedAt, Message } = message;
            const payload = { publishedAt, ...(JSON.parse(Message)) };
            const messageTopic = parts[parts.length - 1];
            const handler = Object.values(handlers).find((h) => {
              return h.getTopic() === messageTopic;
            })
            if (handler && handler.getJob()) {
              const job = handler.getJob();
              if (job) {
                await job.enqueue(payload);
              } else {
              	logger.error(`job not found for topic ${messageTopic}`);
                throw new Error(`job not found for topic ${messageTopic}`);
              }
            } else if (handler) {
              handler.work(payload);
            } else {
              logger.error(`handler not found for topic ${messageTopic}`);
              throw new Error(`handler not found for topic ${messageTopic}`);
            }
          }
        } catch (error) {
          logger.error(error, { group: 'Consumer', subGroup: 'handleMessage' })
          throw error;
        }
      },
    });
    consumer.on('error', (err) => {
		logger.error(err, { group: 'Consumer' });
    });

    consumer.on('processing_error', (err) => {
		logger.error(err, { group: 'Consumer', subGroup: 'Processing' });
    });

    consumer.start();
  }

  static async connect(options = {}) {
    try {
      const queue = (process.env.APP_CLUSTER && process.env.APP_CONSUMER_NAME) ? `${process.env.APP_CLUSTER}-${process.env.APP_CONSUMER_NAME}-messages` : `local-${process.pid}-messages`;

      const createOrFetchTopic = (topic) => {
        return SNS.createTopic({ Name: topic }).promise();
      }

      const createOrFetchQueue = (queueName) => {
        return SQS.createQueue({ QueueName: queueName }).promise();
      }

      const getQueueAttrs = (queueUrl) => {
        return SQS.getQueueAttributes({ QueueUrl: queueUrl, AttributeNames: ['QueueArn'] }).promise();
      }

      const setQueueAttributes = (topicArns = [], queueArn, deadLetterTargetArn, queueUrl) => {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: '',
              Effect: 'Allow',
              Principal: {
                AWS: '*',
              },
              Action: 'SQS:*',
              Resource: queueArn,
              Condition: {
                ArnEquals: {
                  'aws:SourceArn': topicArns,
                },
              },
            },
          ],
        };

        const policyParams = {
          Attributes: {
            Policy: JSON.stringify(policy),
            RedrivePolicy: JSON.stringify({ deadLetterTargetArn, maxReceiveCount: '2' }),
          },
          QueueUrl: queueUrl,
        };

        return SQS.setQueueAttributes(policyParams).promise();
      }

      const susbribeToTopic = (topicArn, queueArn) => {
        SNS.subscribe({
          TopicArn: topicArn,
          Protocol: 'sqs',
          Endpoint: queueArn,
        }, (snsSubscribeError) => {
          if (snsSubscribeError) throw snsSubscribeError;
        });
      }

      const { QueueUrl } = await createOrFetchQueue(queue);
      const queueUrl = QueueUrl;

      const { Attributes } = await getQueueAttrs(queueUrl);
      const queueArn = Attributes.QueueArn;

      const { QueueUrl: DeadLetterQueueUrl } = await createOrFetchQueue('dead-letter');
      const deadLetterQueueUrl = DeadLetterQueueUrl;

      const { Attributes: DeadLetterAttributes } = await getQueueAttrs(deadLetterQueueUrl);
      const deadLetterQueueArn = DeadLetterAttributes.QueueArn;

      const createTopicPromises = Object.values(handlers).map((h) => {
        const topic = h.getTopic();
        return createOrFetchTopic(topic);
      });
      const topicResponses = await Promise.all(createTopicPromises);

      const topicArns = topicResponses.map((topicResponse) => {
        return topicResponse.TopicArn;
      })
      await setQueueAttributes(topicArns, queueArn, deadLetterQueueArn, queueUrl);

      const subscriptionPromises = topicResponses.map((topicResponse) => {
        const topicArn = topicResponse.TopicArn;
        return susbribeToTopic(topicArn, queueArn);
      })
      await Promise.all(subscriptionPromises);

      this.run(queueUrl, options);
    } catch (error) {
		logger.error(error, { supplementalMessage: `Error connecting consumer` });
    }
  }

  static registerHandler(name, Clazz) {
    if (Clazz) {
      if (handlers[name]) {
        throw new Error('would overwrite existing model');
      } else {
        const instantiatedHandler = new Clazz();
        if (Object.values(handlers).map(h => h.getTopic()).includes(instantiatedHandler.topic)) {
          throw new Error(`Duplicate Topic Registration error: cannot register "${name}", a producer is already registered to topic "${instantiatedHandler.topic}"`);
        } else {
          handlers[name] = instantiatedHandler;
        }
      }
    }
    return handlers[name];
  }
}

module.exports = BaseConsumer;
