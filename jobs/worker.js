const Arena = require('bull-arena');
const express = require('express');
const { log } = require('../initializers');

const arenaAuth = require('../initializers/arena-auth');

const jobs = require('./models');

const logger = log.gcLogger;
const { cluster, port } = process.convict.get('application');
const { bullDb, host, port: redisPort } = process.convict.get('redis');


const register = () => {
	const arenaQueues = [];
	// For all the jobs I'v loaded start their workers by calling connect()
	jobs.modelNames().forEach((name) => {
		jobs.model(name).connect();
		arenaQueues.push({
			hostId: 'gc',
			name: jobs.model(name).queueName,
			prefix: cluster || 'bull',
			redis: {
				db: parseInt(bullDb) || 12,
				host,
				port: redisPort,
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
	app.set('port', port);

	app.use(arenaAuth);
	app.use('/', arenaConfig);

	app.listen(app.get('port'), () => {
		logger.info(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
		logger.info('  Press CTRL-C to stop\n');
	});
}

const deregister = () => {
	logger.info('worker - shutdown');
	jobs.modelNames().forEach((name) => {
		jobs.model(name).disconnect();
	});
}

module.exports = {
	register,
	deregister,
}
