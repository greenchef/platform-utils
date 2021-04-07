const express = require('express');
const { router, setQueues, BullAdapter } = require('bull-board')

const { log } = require('../initializers');


const logger = log.gcLogger;

// Needs to be after other initializers for dotenv loading
const arenaAuth = require('../initializers/arena-auth');

const jobs = require('./models');

const register = () => {
	const bullBoardQueues = [];
	// For all the jobs I've loaded start their workers by calling connect()
	jobs.modelNames().forEach((name) => {
		const queue = jobs.model(name).connect();
		bullBoardQueues.push(new BullAdapter(queue));
	});

	setQueues(bullBoardQueues);

	const app = express();

	// set app constants
	app.set('host', '127.0.0.1');
	app.set('port', parseInt(process.env.ARENA_PORT) || 4000);

	app.use(arenaAuth);
	app.use('/', router)


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
