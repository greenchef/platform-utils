
const asyncWrap = require('./async.middleware');

module.exports = (...allowedPermissions) => asyncWrap(async (req, res, next) => {
	const { account: { permissions = [] } } = req;
	const intersection = new Set([...allowedPermissions].filter(allowed => permissions.includes(allowed)));
	const notAuthorized = intersection.size === 0;
	if (notAuthorized) return res.sendStatus(403);
	return next();
});
