// All modules that need to run at app boot

require('./dotenv'); // must be first

// NOTE: Do not include the arena-auth initializer - it is optional and should be imported directly if needed
const apm = require('./elastic-apm'); // This should always immediately follow dotenv load.
const errors = require('./errors');
const joi = require('./joi');
const log = require('./logger');
const mongoose = require('./mongoose');
const sequelize = require('./sequelize');
const utils = require('./utils');

module.exports = {
	apm,
	errors,
	joi,
	log,
	mongoose,
	sequelize,
	utils,
};
