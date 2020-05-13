/* eslint-disable no-await-in-loop */
const _ = require('lodash');

class Resolver {
	constructor(collectionSeeders) {
		this.seedersToProcess = [...collectionSeeders];
		this.zeroDepSeeders = [];
		this.processedSeeders = [];
	}

	sortSeeders(seedersToSort) {
		const sortedSeeders = _.sortBy(seedersToSort, seeder => {
			return seeder.getNumDepsRemaining();
		});
		return sortedSeeders;
	}

	async resolve() {
		let i = 0;
		let doneProcessing = false;

		while (this.seedersToProcess.length && !doneProcessing) {
			// sort the un-processed seeders on number of unmet dependencies
			this.seedersToProcess = this.sortSeeders(this.seedersToProcess);

			// Get all seeders with zero unmet dependencies
			const lastZeroIdx = _.findLastIndex(this.seedersToProcess, seeder => {
				return seeder.getNumDepsRemaining() === 0;
			});

			const newZeroDepSeeders = this.seedersToProcess.splice(
				0,
				lastZeroIdx + 1
			);

			this.zeroDepSeeders = [...newZeroDepSeeders];

			if (this.zeroDepSeeders.length) {
				// Seed all zero dependency seeders
				const depsToResolve = await Promise.all(_.map(this.zeroDepSeeders, async zeroDepSeeder => {
					return {
						collectionName: zeroDepSeeder.collectionName
					};
				}));

				// remove the collections we just seeded from un-processed seeds' list of unmet dependencies
				_.each(this.seedersToProcess, seederToProcess => {
					seederToProcess.removeDependencies(depsToResolve);
				});

				// add seeders we just processed to list of processed seeders
				this.processedSeeders = this.processedSeeders.concat(
					this.zeroDepSeeders
				);

				// clear zero dependency seeders once they have been moved into processed list
				this.zeroDepSeeders.length = 0;
			} else {
				// TODO: this should probably throw an actual error/
				console.log('ERROR: Circular dependency');
				doneProcessing = true;
			}

			i++;
			if (i >= this.numSeeds) {
				doneProcessing = true;
			}
		}
	}
}

module.exports = Resolver;
