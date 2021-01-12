// All modules that need to run at app boot
// NOTE: Do not include the arena-auth initializer - it is optional and should be imported directly if needed
const apm = require('./elastic-apm');
const errors = require('./errors');
const joi = require('./joi');
const log = require('./logger');
const utils = require('./utils');
const mongoose = require('./mongoose');

module.exports = {
	apm,
	errors,
	joi,
	log,
	mongoose,
	utils,
};
