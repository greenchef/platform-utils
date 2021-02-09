const asyncWrap = require('./async.middleware');
const createUserToken = require('./create-user-token.middleware');
const httpErrorHandler = require('./http-error-handler.middleware');
const jwtDecode = require('./jwt-decode.middleware');
const permit = require('./permit.middleware');

module.exports = {
	asyncWrap,
	createUserToken,
	httpErrorHandler,
	jwtDecode,
	permit,
};
