const _ = require('lodash');


class CollectionSeeder {
	constructor(config) {
		// TODO: add config validation;
		this.collectionName = config.collectionName;
		this.dependencies = config.dependencies || [];
		this.seedFunction = config.seedFunction;
		this.unmetDependencies = _.cloneDeep(this.dependencies);

	}

	removeDependencies(collections) {
		this.unmetDependencies = _.differenceBy(
			this.unmetDependencies,
			collections,
			'collectionName'
		);
	}

	getNumDepsRemaining() {
		return this.unmetDependencies.length;
	}

	async doSeed() {
		if (this.seedFunction) {
			try {
				await this.seedFunction();
			} catch (error) {
				console.log(`error seeding ${this.collectionName}: ${error}`);
			}
		}
	}
}

module.exports = CollectionSeeder;
