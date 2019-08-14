const mongoose = require('mongoose');

const logger = require('./logger');
const utils = require('./utils');

// Connect to MongoDB.
mongoose.Promise = global.Promise;

try {
	const connectWithRetry = () => {
		mongoose.Promise = global.Promise;

		const isMongoose5 = mongoose.version && mongoose.version.startsWith('5');
		let options = { useNewUrlParser: true };
		if (!isMongoose5) options = { ...options, useMongoClient: true };

		return mongoose.connect(utils.getMongoConnectionString(), options, (err) => {
			if (err) {
				logger.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
				setTimeout(connectWithRetry, 5000);
			} else {
				logger.info('mongoose connected!!!!');
			}
		});
	};
	connectWithRetry();
} catch (e) {
	logger.error('unable to start worker: %s', e.stack);
	process.exit(1);
}

module.exports = mongoose;
