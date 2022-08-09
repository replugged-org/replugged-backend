import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply
} from 'fastify';

import oauthModule from './oauth.js';
import usersModule from './users.js';
import avatarsModule from './avatars.js';
import statsModule from './stats.js';
import docsModule from './docs/index.js';
import backofficeModule from './backoffice/index.js';
import legacyLinking from './legacyLinking.js';
import badgesModule from './badges.js';
import guildsModule from './guilds.js';
import storeModule from './store/index.js';

function logout (_: FastifyRequest, reply: FastifyReply): void {
  reply.setCookie('token', '', { maxAge: 0,
    path: '/' }).redirect('/');
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/login', (req: FastifyRequest, reply: FastifyReply) => void reply.redirect(`/api/v1/oauth/discord?${req.url.split('?')[1] ?? ''}`));
  fastify.get('/logout', { config: { auth: {} } }, logout);

  fastify.register(oauthModule, { prefix: '/oauth' });
  fastify.register(usersModule, { prefix: '/users' });
  fastify.register(avatarsModule, { prefix: '/avatars' });
  fastify.register(statsModule, { prefix: '/stats' });
  fastify.register(docsModule, { prefix: '/docs' });
  fastify.register(backofficeModule, { prefix: '/backoffice' });
  fastify.register(guildsModule, { prefix: '/guilds' });
  fastify.register(badgesModule, { prefix: '/badges' });
  fastify.register(storeModule, { prefix: '/store' });
  fastify.register(legacyLinking);
}
