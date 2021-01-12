const auth = require('basic-auth');

const password = process.convict.get('arena.password');

if (!password) throw Error('ARENA_PASSWORD environment variable not provided for arena-auth initializer.');

// Map of user.name and user.password
const admins = {
	admin: { password: `${password}` },
};

module.exports = (req, res, next) => {
	const user = auth(req);
	if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
		res.set('WWW-Authenticate', 'Basic realm="Bull-Arena"');
		return res.status(401).send('Access Denied');
	}
	return next();
};
