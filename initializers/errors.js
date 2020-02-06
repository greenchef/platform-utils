/* eslint-disable max-classes-per-file */
class DomainError extends Error {
	constructor(message) {
		super(message);
		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name;
		// This clips the constructor invocation from the stack trace.
		// It's not absolutely essential, but it does make the stack trace a little nicer.
		//  @see Node.js reference (bottom)
		Error.captureStackTrace(this, this.constructor);
	}
}

class BadRequestError extends DomainError {
	constructor(message, query) {
		super(message);
		this.data = { message, query };
	}
}

class ResourceNotFoundError extends DomainError {
	constructor(message, query) {
		super(message);
		this.data = { message, query };
	}
}

class FailedDependencyError extends DomainError {
	constructor(message, query) {
		super(message);
		this.data = { message, query };
	}
}

// I do something like this to wrap errors from other frameworks.
// Correction thanks to @vamsee on Twitter:
// https://twitter.com/lakamsani/status/1035042907890376707
class InternalError extends DomainError {
	constructor(error) {
		super(error.message);
		this.data = { error };
	}
}

class UnauthorizedError extends DomainError {
	constructor(message) {
		super(message);
		this.data = { message };
	}
}

class ValidationError extends DomainError {
	constructor(message, payload) {
		super(message);
		this.data = { message, payload };
	}
}

module.exports = {
	BadRequestError,
	FailedDependencyError,
	InternalError,

	ResourceNotFoundError,
	UnauthorizedError,
	ValidationError,
};
