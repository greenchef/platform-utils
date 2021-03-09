const LIMIT = 50;
const SKIP = 0;
const SORT_ORDER = 'ASC';

const searchOptions = (req, defaultSortProp = 'id') => {
	const options = {
		limit: LIMIT,
		skip: SKIP,
		sortOrder: SORT_ORDER,
		sortProperty: defaultSortProp,
	};

	if (req.limit === 0 || (req.query && req.query.limit === 0) || (req.body && req.body.limit === 0)) {
		options.limit = 0;
	} else if (req.limit || (req.query && req.query.limit) || (req.body && req.body.limit)) {
		options.limit = req.limit || req.query.limit || req.body.limit;
	}
	delete req.limit;
	if (req.query) delete req.query.limit;
	if (req.body) delete req.body.limit;

	if (req.skip || (req.query && req.query.skip) || (req.body && req.body.skip)) {
		options.skip = req.skip || req.query.skip || req.body.skip;
	}
	delete req.skip;
	if (req.query) delete req.query.skip;
	if (req.body) delete req.body.skip;

	if (req.sortOrder || (req.query && req.query.sortOrder) || (req.body && req.body.sortOrder)) {
		options.sortOrder = req.sortOrder || req.query.sortOrder || req.body.sortOrder;
		options.sortOrder = options.sortOrder === 1 ? 'ASC' : 'DESC';
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
	searchOptions,
};
