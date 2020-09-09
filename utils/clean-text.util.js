const latinize = require('latinize');

module.exports = (string) => {
	let latinizedText = latinize(string);

	// replace all characters that don't match with -
	const searchRegExp = /[^a-zA-Z0-9\s]/g;
	const replaceWith = '-';

	return latinizedText.replace(searchRegExp, replaceWith);
};
