'use strict';

exports.never = ({ ...options } = {}) => {
	return caching('no-store, must-revalidate', options);
};

exports.private = ({ duration = 0, ...options } = {}) => {
	expectPositiveInteger(duration, 'duration');
	return caching(`max-age=${duration}, must-revalidate, private`, options);
};

exports.shared = ({ duration = 0, sharedDuration, ...options } = {}) => {
	expectPositiveInteger(duration, 'duration');
	if (sharedDuration === undefined) {
		return caching(`max-age=${duration}, must-revalidate, public`, options);
	}
	expectPositiveInteger(sharedDuration, 'sharedDuration');
	return caching(`max-age=${duration}, s-maxage=${sharedDuration}, must-revalidate, public`, options);
};

const caching = (cacheControl, { condition = isCacheableStatusCode, allowUnsafe = false }) => {
	if (typeof condition !== 'function') {
		throw new TypeError('Expected \'condition\' option to be a function');
	}
	if (typeof allowUnsafe !== 'boolean') {
		throw new TypeError('Expected \'allowUnsafe\' option to be a boolean');
	}

	return (req) => {
		const { method } = req;
		if (method === 'GET' || method === 'HEAD' || allowUnsafe && method === 'POST') {
			return (res) => {
				if (condition(req, res)) {
					res.headers.set('cache-control', cacheControl);
				}
			};
		}
	};
};

const expectPositiveInteger = (value, name) => {
	if (typeof value !== 'number') {
		throw new TypeError(`Expected '${name}' option to be a number`);
	}
	if (!Number.isInteger(value) || value < 0) {
		throw new TypeError(`Expected '${name}' option to be a positive integer`);
	}
};

const CACHEABLE_CODES = new Set([200, 203, 204, 206, 300, 301, 304, 404, 405, 410, 414, 501]);
const isCacheableStatusCode = (req, res) => CACHEABLE_CODES.has(res.code);
