import fastifyFactory, {
    type FastifyRequest,
    type FastifyReply,
} from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyMongodb from '@fastify/mongodb'
import fastifyRawBody from 'fastify-raw-body'

// @ts-ignore pls shut up ts
import config from './config.js'

import authPlugin from './utils/auth.js'

import apiModule from "./api/index.js";

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
fastify.register(authPlugin)

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