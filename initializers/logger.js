const bunyan = require('bunyan');

if (!process.env.LOGGER_NAME) {
	throw Error('LOGGER_NAME environment variable not provided for logger initializer.');
}

const logger = bunyan.createLogger({
	name: process.env.LOGGER_NAME,
	level: process.env.LOG_LEVEL || 'debug',
	src: true,
	stream: process.stdout,
});

module.exports = logger;
