'use strict'

/**
 * response.js
 *
 * Response class provides content decoding
 */

const http = require('http')

const Headers = require('./headers.js');
const Body = require('./body.js');
const clone = Body.clone
const extractContentType = Body.extractContentType

const INTERNALS = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor(body, opts) {
		if (!opts) opts = {}
		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers)

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers
		};
	}

	get url() {
		return this[INTERNALS].url;
	}

	get status() {
		return this[INTERNALS].status;
	}

	/**
	 * Convenience property representing if the request ended normally
	 */
	get ok() {
		return this[INTERNALS].status >= 200 && this[INTERNALS].status < 300;
	}

	get statusText() {
		return this[INTERNALS].statusText;
	}

	get headers() {
		return this[INTERNALS].headers;
	}

	/**
	 * Clone this response
	 *
	 * @return  Response
	 */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok
		});

	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});
module.exports = Response