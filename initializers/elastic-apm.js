// Add this to the VERY top of the first file loaded in your app
// If the env is configured to use apm
const apm = require('elastic-apm-node');

const { secret, url } = process.convict.get('apm');
const { cluster, environment, service } = process.convict.get('app');
const { level } = process.convict.get('logger');

apm.start({
	active: cluster && service && secret && url,
	environment: environment || 'staging',
	logLevel: level || 'error',
	// Override service name from package.json
	// Allowed characters: a-z, A-Z, 0-9, -, _, and space
	serviceName: `${cluster}-${service}`,
	secretToken: secret, // Use if APM Server requires a token
	serverUrl: url, // Set custom APM Server URL (default: http://localhost:8200)
})


module.exports = apm;
