const bunyan = require('bunyan');

const logger = bunyan.createLogger({
	name: process.env.LOGGER_NAME || 'unnamed',
	level: process.env.LOG_LEVEL || 'debug',
	src: true,
	stream: process.stdout,
});

module.exports = logger;
