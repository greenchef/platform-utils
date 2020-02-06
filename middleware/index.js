const asyncWrap = require('./async.middleware');
const httpErrorHandler = require('./http-error-handler.middleware');
const jwtDecode = require('./jwt-decode.middleware');
const permit = require('./permit.middleware');

module.exports = {
	asyncWrap,
	httpErrorHandler,
	jwtDecode,
	permit,
};
