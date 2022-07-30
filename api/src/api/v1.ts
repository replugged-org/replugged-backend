import type {
    FastifyInstance,
    FastifyRequest,
    FastifyReply
} from 'fastify'

import oauthModule from './oauth.js';
import usersModule from './users.js'

function logout(_: FastifyRequest, reply: FastifyReply): void {
    reply.setCookie('token', '', { maxAge: 0, path: '/' }).redirect('/');
}

export default async function (fastify: FastifyInstance) {
    fastify.get('/login', (req: FastifyRequest, reply: FastifyReply) => void reply.redirect(`/api/v1/oauth/discord?${req.url.split('?')[1] ?? ''}`));
    fastify.get('/logout', { config: { auth: {} } }, logout)

    fastify.register(oauthModule, { prefix: '/oauth' });
    fastify.register(usersModule, { prefix: '/users'})
}