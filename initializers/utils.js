const mongoose = require('mongoose');

const logger = require('./logger');

const createMongooseConnection = connectionString => {
	mongoose.Promise = global.Promise;
	try {
		const connectWithRetry = () => {
			mongoose.Promise = global.Promise;

			const isMongoose5 = mongoose.version && mongoose.version.startsWith('5');
			let options = { useNewUrlParser: true };
			if (!isMongoose5) options = { ...options, useMongoClient: true };

			return mongoose.connect(connectionString, options, (err) => {
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
		logger.error('unable to connect to mongoose: %s', e.stack);
		process.exit(1);
	}
	return mongoose;
}

const getMongoConnectionString = () => {
	if (!(process.env.MONGODB_URI || process.env.MONGO_URI)) {
		throw Error('No mongo connection string detected! One of (MONGO_URI, [MONGODB_URI, MONGODB_NAME, MONGODB_OPTIONS]) must be provided.');
	}

	return process.env.MONGODB_URI
		? `${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}${process.env.MONGODB_OPTIONS}`
		: process.env.MONGO_URI;
}

const isProdDB = () => {
	const connection = getMongoConnectionString();
	return connection.includes('PROD') || connection.includes('greenchef-atlas-shard');
}

module.exports = {
	createMongooseConnection,
	getMongoConnectionString,
	isProdDB,
}
