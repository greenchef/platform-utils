const mongoose = require('mongoose');

const extendFactory = (factory, Model) => {
	const clearAll = () => Model.deleteMany({});

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
		const fac = factory.build(attrs);
		Object.keys(fac).forEach((x) => {
			if (fac[x] instanceof mongoose.Types.ObjectId) {
				fac[x] = fac[x].toString();
			}
		});
		return fac;
	};

	Object.assign(factory, { create, createMany, clearAll, requestPayload });
};

module.exports = {
	extendFactory,
};
