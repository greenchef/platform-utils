const bunyan = require('bunyan');
const stackTrace = require('stacktrace-js');

const DEFAULT_OPTIONS = {
	name: process.env.LOGGER_NAME,
	level: process.env.DISABLE_LOGS_FOR_TESTS ? bunyan.FATAL + 1 : (process.env.LOG_LEVEL || 'debug'),
	src: true,
	serializers: bunyan.stdSerializers,
	stream: process.stdout,
};

const getStack = () => stackTrace.getSync().map(sf => ({
	func: sf.functionName,
	file: sf.fileName,
	line: sf.lineNumber,
	col: sf.columnNumber
}));

const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const createGcLogger = logger => ({
	child: options => {
		const child = logger.child(options);
		const handler = createHandler(child);

		return new Proxy(child, handler);
	},
	log: level => function() {
		if(arguments.length) {
			const [first, data = {}, meta = {}] = arguments;
			let message, err;

			if(typeof first === 'string') {
				message = first;
			} else if (first instanceof Error) {
				err = first;
				message = data.supplementalMessage || err.message;
			} else {
				throw Error("First argument to log methods must be an Error or 'string' message");
			}

			let group = data.group;
			let subGroup = data.subGroup;

			let stack;
			if(level === 'fatal' || level === 'error') {
				stack = getStack().slice(2);
				const { func, file, line, col } = stack[0];
				group = group || `${file}:${line}:${col}`;
				subGroup = subGroup || func;
			}

			return logger[level]({
				err,
				...data,
				...meta,
				group,
				subGroup,
				stack,
			}, message);
		} else {
			return logger[level]();
		}
	},
});

const createHandler = logger => {
	const gcLogger = createGcLogger(logger);

	const handler = {
		get: (target, name) => {
			if (Object.keys(gcLogger).includes(name)) {
				return gcLogger[name];
			}

			if (LEVELS.includes(name)) {
				return gcLogger.log(name);
			}

			return target[name];
		}
	};

	return handler;
};

const createLogger = options => {
	const resolvedOptions = {
		...DEFAULT_OPTIONS,
		...options
	  };

	if(!resolvedOptions.name) {
		throw Error('Logger name not provided for logger initializer.');
	}

	const logger = bunyan.createLogger(resolvedOptions);
	const handler = createHandler(logger);

	return new Proxy(logger, handler);
};

// temporary legacy support
const logger = bunyan.createLogger(DEFAULT_OPTIONS);

// default implementation of new logger
const gcLogger = createLogger({ src: false });

module.exports = {
	createLogger,
	gcLogger,
	logger,
};
