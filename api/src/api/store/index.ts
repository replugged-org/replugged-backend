import type {FastifyInstance} from 'fastify';
// import { fetchSuggestions } from './suggestions.js'

import itemsModule from './items.js';

export default async function (fastify: FastifyInstance): Promise<void> {
	fastify.register(itemsModule, {prefix: '/'});
}
