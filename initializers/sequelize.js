const connections = {};
let sequelize;
const sequelizeConnection = (connectionString) => {
	if (!connections[connectionString]) {
		sequelize = require('sequelize');
		const { Sequelize } = sequelize;
		connections[connectionString] = new Sequelize(connectionString);
	}
	return { db: connections[connectionString], sequelize }
}

module.exports = sequelizeConnection;