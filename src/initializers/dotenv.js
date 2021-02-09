const dotenv = require('dotenv');

const { error } = dotenv.config();
if (error) {
	console.error('Failed to parse environment variables.', error);
	throw error;
}
