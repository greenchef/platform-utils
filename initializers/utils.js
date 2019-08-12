const getMongoConnectionString = () => {
	return process.env.MONGODB_URI
		? `${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}${process.env.MONGODB_OPTIONS}`
		: process.env.MONGO_URI;
}

const isProdDB = () => {
	const connection = getMongoConnectionString();
	return connection.includes('PROD') || connection.includes('greenchef-atlas-shard');
}

module.exports = {
	getMongoConnectionString,
	isProdDB,
}
