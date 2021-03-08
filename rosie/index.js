const extendFactory = (factory, Model) => {

	const clearAll = () => {
		if (typeof Model.deleteMany === "function") return Model.deleteMany({});
		else if (typeof Model.destroy === "function") return Model.destroy({ truncate: true });
	};

	const create = (attrs = {}, options = {}) => {
		try {
			if (!Model) return null;
			return new Model(factory.build(attrs, options)).save();
		} catch (err) {
			console.log(err);
		}
	};

	/**
  * Create multiple records at once
  * @param {number} num - how many to create
  * @param {Object} [attrs] - attributes to apply to factory objects created
  * @return {Promise<Model[]>}
  */
	const createMany = async (num, attrs = {}, options = {}) => {
		return Promise.all(Array.from(Array(num)).map(() => create(attrs, options)));
	};

	const requestPayload = (attrs = {}) => {
		const mongoose = require('mongoose');
		const fac = factory.build(attrs);
		Object.keys(fac).forEach((x) => {
			if (fac[x] instanceof mongoose.Types.ObjectId) {
				fac[x] = fac[x].toString();
			}
		});
		return fac;
	};

	const seed = async (seedName, params) => {
		const { seeds } = factory.statics;
		if (seedName === 'all') {
			return Promise.all(Object.values(seeds).map(seedDefinition => create({ ...seedDefinition, ...params })));
		}
		const seedDefinition = seeds[seedName] || {};
		return create({ ...seedDefinition, ...params });
	}

	const seedMany = async (seedName, params, num) => {
		const { seeds } = factory.statics;
		if (seedName === 'all') {
			return Promise.all(Object.values(seeds).map(seedDefinition => createMany({ ...seedDefinition, ...params }, num)));
		}
		const seedDefinition = seeds[seedName] || {};
		return createMany({ ...seedDefinition, ...params }, num);
	}

	Object.assign(factory, { create, createMany, clearAll, requestPayload, seed, seedMany });
};

module.exports = {
	extendFactory,
};
