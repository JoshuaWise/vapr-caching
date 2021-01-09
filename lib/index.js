'use strict';

exports.never = () => {
	return caching('no-store, must-revalidate');
};

exports.private = ({ duration = 0 } = {}) => {
	expectPositiveInteger(duration, 'duration');
	return caching(`max-age=${duration}, must-revalidate, private`);
};

exports.shared = ({ duration = 0, sharedDuration } = {}) => {
	expectPositiveInteger(duration, 'duration');
	if (sharedDuration === undefined) {
		return caching(`max-age=${duration}, must-revalidate, public`);
	}
	expectPositiveInteger(sharedDuration, 'sharedDuration');
	return caching(`max-age=${duration}, s-maxage=${sharedDuration}, must-revalidate, public`);
};

const expectPositiveInteger = (value, name) => {
	if (typeof value !== 'number') {
		throw new TypeError(`Expected '${name}' option to be a number`);
	}
	if (!Number.isInteger(value) || value < 0) {
		throw new TypeError(`Expected '${name}' option to be a positive integer`);
	}
};

const caching = (cacheControlHeader) => (req) => (res) => {
	// TODO: check request method
	// TODO: check response code (and include cache-control in 304 responses)
	res.headers.set('cache-control', cacheControlHeader);
};
