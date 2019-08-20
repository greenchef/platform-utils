const middleware = require('../../middleware/index');

describe('middleware', () => {
	describe('middleware.sanitize', () => {
		test('should strip non-whitelisted HTML tags from request body', () => {
			const string = '<script>This could be dangerous!</script>';
			const sanitizedString = 'This could be dangerous!';

			const request = {
				body: {
					string,
					something: {
						string,
					},
				},
			};

			middleware.sanitize(request, {}, () => {});

			expect(request.body.string).toEqual(sanitizedString);
			expect(request.body.something.string).toEqual(sanitizedString);
		});

		test('should retain whitelisted HTML tags in request body', () => {
			const string = 'This is <strong>totally</strong> fine.';

			const request = {
				body: {
					string,
					something: {
						string,
					},
				},
			};

			middleware.sanitize(request, {}, () => {});

			expect(request.body.string).toEqual(string);
			expect(request.body.something.string).toEqual(string);
		});

		test('should replace known non-ascii characters in request body with their ascii equivalents', () => {
			const string = 'here\'s the problem ֆāĕĢ the rest is fine';
			const sanitizedString = 'here\'s the problem aeG the rest is fine';

			const request = {
				body: {
					string,
					something: {
						string,
					},
				},
			};

			middleware.sanitize(request, {}, () => {});

			expect(request.body.string).toEqual(sanitizedString);
			expect(request.body.something.string).toEqual(sanitizedString);
		});

		test('should strip out unknown non-ascii characters in request body', () => {
			const string = 'ֆƱupsilon ɸphi';
			const sanitizedString = 'upsilon phi';

			const request = {
				body: {
					string,
					something: {
						string,
					},
				},
			};

			middleware.sanitize(request, {}, () => {});

			expect(request.body.string).toEqual(sanitizedString);
			expect(request.body.something.string).toEqual(sanitizedString);
		});
	});
});
