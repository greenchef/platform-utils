const auth = require('basic-auth');

if (!process.env.ARENA_PASSWORD) {
	throw Error('ARENA_PASSWORD environment variable not provided for arena-auth initializer.')
}

// Map of user.name and user.password
const admins = {
	admin: { password: `${process.env.ARENA_PASSWORD}` },
};

module.exports = (req, res, next) => {
	const user = auth(req);
	if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
		res.set('WWW-Authenticate', 'Basic realm="Bull-Arena"');
		return res.status(401).send('Access Denied');
	}
	return next();
};