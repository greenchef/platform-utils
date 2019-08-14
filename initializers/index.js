// All modules that need to run at app boot

require('./dotenv'); // must be first

// NOTE: Do not include the arena-auth initializer - it is optional and should be imported directly if needed
const errors = require('./errors');
const joi = require('./joi');
const logger = require('./logger');
const mongoose = require('./mongoose');
const utils = require('./utils');

module.exports = {
	errors,
	joi,
	logger,
	mongoose,
	utils,
};
