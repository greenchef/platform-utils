const Boom = require('boom');
const log = require('../initializers/logger');

const logger = log.gcLogger;

const httpErrorHandler = (err, _req, res, _next) => { // eslint-disable-line no-unused-vars
	let responseErr = err;
	if (!Boom.isBoom(responseErr)) {
		if (responseErr.name === 'ValidationError') {
			responseErr = Boom.badData(responseErr.message);
		} else if (responseErr.name === 'FailedDependencyError') {
			responseErr = Boom.failedDependency(responseErr.message);
		} else if (responseErr.name === 'ResourceNotFoundError') {
			responseErr = Boom.notFound(responseErr.message);
		} else if (responseErr.name === 'BadRequestError') {
			responseErr = Boom.badRequest(responseErr.message);
		} else if (responseErr.name === 'UnauthorizedError') {
			responseErr = Boom.unauthorized(responseErr.message);
		} else if (responseErr.name === 'TypeError') {
			responseErr = Boom.failedDependency(responseErr.message);
		} else {
			responseErr = Boom.boomify(new Error(responseErr), { statusCode: responseErr.status });
		}
	}

	if (responseErr.isServer) logger.error(err);

	return res.status(responseErr.output.statusCode)
		.json(Object.assign(responseErr.output.payload, { data: responseErr.data }));
}


module.exports = httpErrorHandler;
