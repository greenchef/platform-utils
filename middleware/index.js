const asciiFolder = require('fold-to-ascii');
const xss = require('xss');

const xssOptions = {
	stripIgnoreTag: true, // strip out tags not in whitelist instead of escaping them
};

const sanitize = (req, res, next) => {
	let bodyString = JSON.stringify(req.body);

	// Strip untrusted HTML from the body of incoming requests to prevent XSS attacks
	bodyString = xss(bodyString, xssOptions);

	// Normalize known non-ascii characters to ascii and strip unknown non-ascii characters
	bodyString = asciiFolder.foldReplacing(bodyString);

	req.body = JSON.parse(bodyString);
	next();
};

module.exports = {
	sanitize: sanitize,
};
