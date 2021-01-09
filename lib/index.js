'use strict';

exports.never = () => {
	return caching('no-store, must-revalidate', false);
};

exports.private = ({ duration = 0, allowUnsafe = false } = {}) => {
	expectPositiveInteger(duration, 'duration');
	return caching(`max-age=${duration}, must-revalidate, private`, !!allowUnsafe);
};

exports.shared = ({ duration = 0, sharedDuration, allowUnsafe = false } = {}) => {
	expectPositiveInteger(duration, 'duration');
	if (sharedDuration === undefined) {
		return caching(`max-age=${duration}, must-revalidate, public`, !!allowUnsafe);
	}
	expectPositiveInteger(sharedDuration, 'sharedDuration');
	return caching(`max-age=${duration}, s-maxage=${sharedDuration}, must-revalidate, public`, !!allowUnsafe);
};

const expectPositiveInteger = (value, name) => {
	if (typeof value !== 'number') {
		throw new TypeError(`Expected '${name}' option to be a number`);
	}
	if (!Number.isInteger(value) || value < 0) {
		throw new TypeError(`Expected '${name}' option to be a positive integer`);
	}
};

const caching = (cacheControlHeader, allowUnsafe) => ({ method }) => {
	if (method === 'GET' || method === 'HEAD' || allowUnsafe && method === 'POST') {
		return  (res) => {
			// TODO: check response code (and include cache-control in 304 responses)
			// 200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501 are cacheable by default
			res.headers.set('cache-control', cacheControlHeader);
		};
	}
};
