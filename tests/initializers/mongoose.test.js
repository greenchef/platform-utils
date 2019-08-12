test('should export a  mongoose instance', () => {
	expect.assertions(1);
	const mongoose = require('../../initializers/mongoose');
	expect(mongoose.connections).toBeDefined();
});

test('should be connected', (done) => {
	expect.assertions(1);
	const mongoose = require('../../initializers/mongoose');

	const waitWhileConnecting = () => {
		if (mongoose.connection.readyState === 2) { // connecting
			setTimeout(waitWhileConnecting, 500);
			return;
		}

		expect(mongoose.connection.readyState).toBe(1); // connected
		done();
	}
	waitWhileConnecting();
});
