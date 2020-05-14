const utils = require('./utils');

module.exports = utils.createMongooseConnection(utils.getMongoConnectionString());
