// Add this to the VERY top of the first file loaded in your app
// If the env is configured to use apm
const apm = require('elastic-apm-node');

apm.start({
	active: (process.env.APP_CLUSTER && process.env.APP_SERVICE && process.env.APM_SECRET && process.env.APM_URL) ? true : false,
	environment: process.env.APP_ENVIRONMENT || 'staging',
	logLevel: process.env.LOG_LEVEL || 'error',
	// Override service name from package.json
	// Allowed characters: a-z, A-Z, 0-9, -, _, and space
	serviceName: `${process.env.APP_CLUSTER}-${process.env.APP_SERVICE}`,

	// Use if APM Server requires a token
	secretToken: process.env.APM_SECRET,

	// Set custom APM Server URL (default: http://localhost:8200)
	serverUrl: process.env.APM_URL,
})


module.exports = apm;
