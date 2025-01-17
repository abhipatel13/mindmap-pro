/* eslint-disable n/prefer-global/process --
 Vercel Edge Runtime does not support node:process */
import { Server } from '../../output/server/index.js';
import { manifest } from './manifest.js';

const server = new Server(manifest);
const initialized = server.init({
	env: /** @type {Record<string, string>} */ (process.env)
});

/**
 * @param {Request} request
 * @param {import('../index.js').RequestContext} context
 */
export default async (request, context) => {
	await initialized;

	return server.respond(request, {
		getClientAddress() {
			return /** @type {string} */ (request.headers.get('x-forwarded-for'));
		},
		platform: {
			context
		}
	});
};
