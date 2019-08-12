// list all modules that need to run at app boot
require('./dotenv'); // must be first
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
