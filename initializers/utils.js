const getMongoConnectionString = () => {
	if (!(process.env.MONGODB_URI || process.env.MONGO_URI)) {
		throw Error('No mongo connection string detected! One of (MONGO_URI, [MONGODB_URI, MONGODB_NAME, MONGODB_OPTIONS]) must be provided.');
	}

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
