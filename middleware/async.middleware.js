// wrapper for our async route handlers
const asyncMiddleware = fn => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch((err) => {
		next(err);
	});
};

module.exports = asyncMiddleware;
