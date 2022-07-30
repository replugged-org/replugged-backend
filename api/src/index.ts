import fastifyFactory, {
    type FastifyRequest,
    type FastifyReply,
    FastifyInstance,
} from 'fastify'
import type { User } from '../../types/users.js'
import fastifyCookie from '@fastify/cookie'
import fastifyMongodb from '@fastify/mongodb'
import fastifyRawBody from 'fastify-raw-body'

// @ts-ignore pls shut up ts
import config from './config.js'

import { generateToken, Verifiers } from './utils/auth.js'

import apiModule from "./api/index.js";
import { UserFlags } from './flags.js'

const fastify = fastifyFactory({
    logger: {
        level: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
    }
})

fastify.register(fastifyCookie)
fastify.register(fastifyRawBody, { global: false }) // todo: necessary?
fastify.register(fastifyMongodb, { url: config.mango })

fastify.decorateRequest('jwtPayload', null)
fastify.decorateRequest('user', null)
fastify.decorateReply('generateToken', generateToken)

fastify.addHook('onRequest', async function (this: FastifyInstance, request, reply) {
    request.jwtPayload = null;
    request.user = null;

    if (!reply.context.config.auth) return; // no auth required;
    const { optional, permissions, allowClient } = reply.context.config.auth

    // check cookies ( web ) and authorization ( client )
    const token = request.cookies.token || request.headers.authorization;
    if (!token) {
        if (!optional) {
            reply.code(401)
            throw new Error('Unauthorized - No token provided')
        }

        return;
    }

    try {
        request.jwtPayload = allowClient ? Verifiers.client(token) : Verifiers.web(token)
    } catch (e) {
        console.log(e)
        if (!optional) {
            reply.code(401)
            throw new Error('Unauthorized - Token is not optional')
        }

        return
    }

    request.user = await this.mongo.db!.collection<User>('users').findOne({
        _id: request.jwtPayload!.id,
        flags: { $bitsAllClear: UserFlags.GHOST | UserFlags.BANNED }
    })

    if (!request.user) {
        if (!optional) {
            reply.code(401)
            throw new Error('Unauthorized - No user')
        }

        return
    }

    if (permissions && (request.user!.flags & permissions) === 0) {
        reply.code(403)
        throw new Error('Insufficient permissions')
    }
})

// todo: figure out why this isn't working
// fastify.register(authPlugin)

fastify.register(apiModule, { prefix: '/api' })
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    void reply.code(404)
        .send({
            error: 404,
            message: 'Not Found',
            url: request.url
        })
})

fastify.ready()
    .then(
        () => fastify.listen({
            port: config.api.port
        }),
        (e: Error) => {
            fastify.log.error(e)
            process.exit(1)
        }
    )