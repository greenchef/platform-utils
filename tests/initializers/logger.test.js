const axios = require('axios');
const request = require('request-promise');

test('should export a bunyan logger', () => {
	expect.assertions(1);
	const { log } = require('../../initializers');
	expect(log.logger).toBeInstanceOf(require('bunyan'));
});

test('should pass response data object to logger on error with an axios request', async (done) => {
	const { log: { gcLogger } } = require('../../initializers');
	try {
		const { data } = await axios.get('https://httpstat.us/404');
	} catch (e) {
		const error = gcLogger.error(e)
		console.log(error)
		console.log('\n\n\n\n\n\n\n\n\n')
		expect(e.message).toExist();
		done()
	}
})

test('should pass response body??? object to logger on error with request request', async (done) => {
	const { log: { gcLogger } } = require('../../initializers');
	try {
		const res = await request.get('https://httpstat.us/404');
	} catch (e) {
		const error = gcLogger.error(e)
		console.log(e)
		console.log('\n\n\n\n\n\n\n\n\n')
		expect(e.message).toExist();
		done()
	}
})
