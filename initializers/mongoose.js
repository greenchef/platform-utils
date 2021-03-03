const utils = require('./utils');

const connect = () => utils.createMongooseConnection(utils.getMongoConnectionString());

module.exports = {
	connect,
}