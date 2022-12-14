import type { FastifyInstance } from 'fastify';
// import { fetchSuggestions } from './suggestions.js'

import formModule from './forms.js';
import itemsModule from './items.js';

export default async function (fastify: FastifyInstance): Promise<void> {
//   fastify.get('/suggestions', (_request: FastifyRequest, reply: FastifyReply) => {
//     reply.header('cache-control', 'public, max-age=86400')
//     fetchSuggestions()
//   })

  fastify.register(formModule, { prefix: '/forms' });
  fastify.register(itemsModule, { prefix: '/items' });
}
