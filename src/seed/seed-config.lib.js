const { MongoClient } = require('mongodb');

const buildDep = (collectionName, db = '', fields = []) => {
	return {
		collectionName,
		db,
		fields,
	};
};

const copyData = async (sourceConnection, collectionName, model, query = {}, options = {}, shouldInsertIndividually = false, shouldPublish = false) => {
	const { SOURCE_DB_NAME, SOURCE_DB_OPTIONS, SOURCE_DB_URI } = sourceConnection;
	const sourceConnectionString = `${SOURCE_DB_URI}/${SOURCE_DB_NAME}${SOURCE_DB_OPTIONS}`;
	const sourceClient = new MongoClient(sourceConnectionString);
	await sourceClient.connect({ useUnifiedTopology: true, useNewUrlParser: true });

	const sourceDB = sourceClient.db(SOURCE_DB_NAME);
	const sourceCollection = sourceDB.collection(collectionName);
	const documentCursor = await sourceCollection.find(query, options);

	if (shouldInsertIndividually) {
		await documentCursor.forEach(async document => {
			await model.collection.insertOne(document);
		})
	} else {
		const documents = await documentCursor.toArray();
		await model.collection.insertMany(documents);
		if (shouldPublish) {
			await publishData(collectionName, documents, SOURCE_DB_NAME)
		}
	}
	await sourceClient.close();
};

const fetchData = async (collection, service) => {
	console.log(`*** fetching ${collection} ***`);
	const msgId = 'fetch'
	return new Promise(resolve => {
		process.send({
			collection,
			msgId,
			service,
			type: 'fetch'
		});

		process.once('message', msg => {
			if (msg && msg.type && msg.type === 'fetch' && msg.msgId === msgId) {
				console.log('******* data received ********', msg.msgId);
				resolve(msg);
			}
		});
	});
};

const publishData = (collection, data, service) => {
	process.send({
		collection,
		data,
		msgId: 'publish',
		service,
		type: 'publish',
	});
}

module.exports = {
	buildDep,
	copyData,
	fetchData,
	publishData,
}
