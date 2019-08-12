const mongoose = require('mongoose');

const logger = require('./logger');
const utils = require('./utils');

// Connect to MongoDB.
mongoose.Promise = global.Promise;

try {
  const connectWithRetry = function connectWithRetry() {
    mongoose.Promise = global.Promise;

    return mongoose.connect(utils.getMongoConnectionString(), { useMongoClient: true, useNewUrlParser: true }, (err) => {
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
