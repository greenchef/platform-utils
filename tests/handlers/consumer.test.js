const AWS = require('aws-sdk');

const mockCreateTopic = jest.fn(() => { return { promise: () => { return { TopicArn: 'fake' } } } } );
const mockSubscribe = jest.fn(() => { return { promise: () => { return {} } } } );
const mockCreatQueue = jest.fn(() => { return { promise: () => { return { QueueUrl: 'fake' } } } } );
const mockGetAttrs = jest.fn(() => { return { promise: () => { return { Attributes: { QueueArn: 'fake' } } } } } );
const mockSetAttrs = jest.fn(() =>{ return { promise: () => { return {} } } } );

AWS.SQS = jest.fn().mockImplementation(() => ({
	createQueue: mockCreatQueue,
	getQueueAttributes: mockGetAttrs,
	setQueueAttributes: mockSetAttrs,
}));

AWS.SNS = jest.fn().mockImplementation(() => ({
	createTopic: mockCreateTopic,
	subscribe: mockSubscribe
}));

function DummyHandlerA() {
  this.topic = 'a';
  this.getTopic = () => 'a';
}

function DummyHandlerB() {
  this.topic = 'b';
  this.getTopic = () => 'b';
}

function DummyHandlerC() {
  this.topic = 'a';
  this.getTopic = () => 'a';
}

describe('BaseConsumer', () => {

	let consumer = null;
	beforeAll(() => {
		consumer = require('../../handlers/consumer')
	})
	

	test('should register non duplicate handler', () => {
		expect.assertions(1);
		consumer.registerHandler('test', DummyHandlerA)
		const response = consumer.registerHandler('testb', DummyHandlerB)
		expect(typeof response).toBe('object');
	});

	test('should not register a duplicate handler', () => {
		expect.assertions(1);
		try {
		consumer.registerHandler('test', DummyHandlerA)
		} catch (err) {
			expect(err.toString()).toBe('Error: would overwrite existing model');
		}
	});

	test('should register not register a duplicate topic', () => {
		expect.assertions(1);
		try {
		consumer.registerHandler('testc', DummyHandlerC)
		} catch (err) {
			expect(err.toString()).toBe('Error: Duplicate Topic Registration error: cannot register \"testc\", a producer is already registered to topic \"a\"');
		}
	});

	test('connect should call all the AWS things', () => {
		consumer.connect()
	})	

})