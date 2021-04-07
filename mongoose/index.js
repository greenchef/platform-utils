const LIMIT = 50;
const POPULATE = '';
const PROJECTION = '';
const SKIP = 0;
const SORT_ORDER = 1;
const SORT_PROPERTY = '_id';

// This handles ensuring we have ids for nested objects as well
const replaceIdsWithStrings = (ret) => {
	if (!ret) return;
	Object.entries(ret).forEach(([key, value]) => {
		if (key === '_id') {
			ret.id = value.toString();
			// delete ret._id;
		} else if (typeof value === 'object') {
			replaceIdsWithStrings(value);
		} else if (Array.isArray(value)) {
			value.forEach(replaceIdsWithStrings);
		}
	});
};

const mongooseTransformDocument = (doc, ret) => {
	const hiddenFields = doc.schema.options.hide;
	const virtualFields = doc.schema.options.virtuals;

	// remove hidden fields
	if (hiddenFields && typeof hiddenFields === 'string') {
		hiddenFields.split(' ').forEach(prop => { delete ret[prop]; });
	}
	// add virtual fields
	if (virtualFields && typeof virtualFields === 'string') {
		virtualFields.split(' ').forEach(prop => { ret[prop] = doc[prop]; });
	}

	replaceIdsWithStrings(ret);

	// eslint-disable-next-line no-underscore-dangle
	delete ret.__v;

	return ret;
};

const mongooseExtendOptions = (Schema) => {
	Object.entries(Schema.tree).forEach(([key, value]) => {
		if (key !== 'id' && key !== '_id' && value.type && value.type.name === 'ObjectId') {
			Schema.virtual(`${key}Id`).get(function stringify() {
				return this[key] ? this[key].toString() : null;
			});
		}
	});

	Schema.set('timestamps', true);
	Schema.set('strictQuery', true);
	Schema.set('toObject', {
		transform: (doc, ret, options) => {
			mongooseTransformDocument(doc, ret, options);
		},
	});
	Schema.set('toJSON', {
		transform: (doc, ret, options) => {
			mongooseTransformDocument(doc, ret, options);
		},
	});

	Schema.statics.search = function search(queryParams = {}, options = {}) {
		let query = this.find(queryParams);

		// Set option defaults
		if (options.limit == null) options.limit = LIMIT;
		if (options.skip == null) options.skip = SKIP;

		// Alter query from options
		if (options.limit !== 0) {
			query = query.skip(Number(options.skip)).limit(Number(options.limit));
		}

		if (options.populate) {
			query = query.populate(options.populate);
		}

		if (options.projection) {
			query = query.select(options.projection);
		}

		if (options.sortProperty) {
			query = query.sort({ [options.sortProperty]: options.sortOrder || SORT_ORDER });
		}

		if (options.lean) {
			query = query.lean();
		}

		return query;
	};
};

const searchOptions = (req) => {
	const options = {
		limit: LIMIT,
		populate: POPULATE,
		projection: PROJECTION,
		skip: SKIP,
		sortOrder: SORT_ORDER,
		sortProperty: SORT_PROPERTY,
	};

	if (req.limit === 0 || (req.query && req.query.limit === 0) || (req.body && req.body.limit === 0)) {
		options.limit = 0;
	} else if (req.limit || (req.query && req.query.limit) || (req.body && req.body.limit)) {
		options.limit = req.limit || req.query.limit || req.body.limit;
	}
	delete req.limit;
	if (req.query) delete req.query.limit;
	if (req.body) delete req.body.limit;

	if (req.populate || (req.query && req.query.populate) || (req.body && req.body.populate)) {
		options.populate = req.populate || req.query.populate || req.body.populate;
	}
	delete req.populate;
	if (req.query) delete req.query.populate;
	if (req.body) delete req.body.populate;

	if (req.projection || (req.query && req.query.projection) || (req.body && req.body.projection)) {
		options.projection = req.projection || req.query.projection || req.body.projection;
	}
	delete req.projection;
	if (req.query) delete req.query.projection;
	if (req.body) delete req.body.projection;

	if (req.skip || (req.query && req.query.skip) || (req.body && req.body.skip)) {
		options.skip = req.skip || req.query.skip || req.body.skip;
	}
	delete req.skip;
	if (req.query) delete req.query.skip;
	if (req.body) delete req.body.skip;

	if (req.sortOrder || (req.query && req.query.sortOrder) || (req.body && req.body.sortOrder)) {
		options.sortOrder = req.sortOrder || req.query.sortOrder || req.body.sortOrder;
	}
	delete req.sortOrder;
	if (req.query) delete req.query.sortOrder;
	if (req.body) delete req.body.sortOrder;

	if (req.sortProperty || (req.query && req.query.sortProperty) || (req.body && req.body.sortProperty)) {
		options.sortProperty = req.sortProperty || req.query.sortProperty || req.body.sortProperty;
	}
	delete req.sortProperty;
	if (req.query) delete req.query.sortProperty;
	if (req.body) delete req.body.sortProperty;

	return options;
};

module.exports = {
	mongooseExtendOptions,
	mongooseTransformDocument,
	searchOptions,
};
