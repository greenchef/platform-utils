const Arena = require('bull-arena');
const express = require('express');
const { logger } = require('../initializers');

// Needs to be after other initializers for dotenv loading
const arenaAuth = require('../initializers/arena-auth');

let jobs = [];

const register = (jobsToRegister) => {
	jobs = jobsToRegister;
	const arenaQueues = [];
	// For all the jobs I'v loaded start their workers by calling connect()
	jobs.modelNames().forEach((name) => {
		jobs.model(name).connect();
		arenaQueues.push({
			hostId: 'gc',
			name: jobs.model(name).queueName,
			prefix: process.env.APP_CLUSTER || 'bull',
			redis: {
				db: parseInt(process.env.REDIS_BULL_DB) || 12,
				host: `${process.env.REDIS_HOST}`,
				port: 6379,
			}
		});
	});

	const arenaConfig = Arena(
		{
			queues: arenaQueues,
		},
		{
			basePath: '/arena',
			disableListen: true
		}
	);

	// Make arena's resources (js/css deps) available at the base app route

	const app = express();

	// set app constants
	app.set('host', '127.0.0.1');
	app.set('port', 4000);

	app.use(arenaAuth);
	app.use('/', arenaConfig);

	app.listen(app.get('port'), () => {
		logger.info('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
		logger.info('  Press CTRL-C to stop\n');
	});
}

const deregister = (jobsToDeregister) => {
	jobs = jobsToDeregister || jobs;
	logger.info('worker - shutdown');
	jobs.modelNames().forEach((name) => {
		jobs.model(name).disconnect();
	});
}

module.exports = {
	register,
	deregister,
}