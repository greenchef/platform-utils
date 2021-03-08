test('should export a  mongoose connector', () => {
	expect.assertions(1);
	const mongoose = require('../../initializers/mongoose');
	expect(mongoose.connect).toBeDefined();
});

test('should be connected', (done) => {
	expect.assertions(1);
	const mongoose = require('../../initializers/mongoose');
	const mongoosConnection = mongoose.connect()
	const waitWhileConnecting = () => {
		if (mongoosConnection.connection.readyState === 2) { // connecting
			setTimeout(waitWhileConnecting, 500);
			return;
		}

		expect(mongoosConnection.connection.readyState).toBe(1); // connected
		done();
	}
	waitWhileConnecting();
});
