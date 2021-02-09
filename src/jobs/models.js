const jobs = {
	models: {},

	model(name, clazz) {
		if (clazz) {
			if (this.models[name]) {
				throw new Error('would overwrite existing model');
			} else {
				this.models[name] = new clazz();
			}
		}
		return this.models[name];
	},

	modelNames() {
		const names = Object.keys(this.models);
		return names;
	}
};

module.exports = jobs;
