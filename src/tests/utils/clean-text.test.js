const cleanText = require('../../utils/clean-text.util');

describe('Clean Text Util', () => {
	test('should return empty string', () => {
		const text = '';
		const cleanedText = cleanText(text);
		expect(cleanedText).toBe(text);
	});

	test('should return same full name', () => {
		const text = 'john doe';
		const cleanedText = cleanText(text);
		expect(cleanedText).toBe(text);
	});

	test('should covert correct character', () => {
		const text = 'colaço';
		const cleanedText = cleanText(text);
		expect(cleanedText).toBe('colaco');
	});

	test('should replace character with -', () => {
		const text = 'co&#o';
		const cleanedText = cleanText(text);
		expect(cleanedText).toBe('co--o');
	});

	test('should throw when passing int', () => {
		const integer = 34234;
		expect(() => cleanText(integer)).toThrow();
	});
});
