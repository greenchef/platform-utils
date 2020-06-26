const jwt = require('jsonwebtoken');

module.exports = (permissions) => {
	return jwt.sign({ permissions }, 'abc123')
};