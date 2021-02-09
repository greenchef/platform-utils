const jwt = require('jsonwebtoken');

const asyncWrap = require('./async.middleware');

module.exports = () => {
	return asyncWrap(async (req, res, next) => {
		const authHeader = (req.headers || {}).authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const decoded = jwt.decode(authHeader.split('Bearer ')[1]);
			req.account = decoded;
		}
		return next();
	});
};
