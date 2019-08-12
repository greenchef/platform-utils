// list all modules that need to run at app boot
require('./dotenv'); // must be first
const joi = require('./joi');
const logger = require('./logger');
const mongoose = require('./mongoose');

module.exports = {
  joi,
  logger,
  mongoose,
};
