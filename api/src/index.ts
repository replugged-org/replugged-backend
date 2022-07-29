import fastifyFactory, {
    type FastifyRequest,
    type FastifyReply,
} from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyMongodb from '@fastify/mongodb'
import fastifyRawBody from 'fastify-raw-body'

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
fastify.register(fastifyMongodb, { url: `${config.mango}?appName=Powercord%20API` })

fastify.decorateRequest('jwtPayload', null)
fastify.decorateRequest('user', null)
fastify.register(authPlugin)

fastify.register(apiModule)
fastify.setNotFoundHandler((_: FastifyRequest, reply: FastifyReply) => void reply.code(404).send({ error: 404, message: 'Not Found' }))

fastify.ready()
    .then(
        () => fastify.listen({
            port: config.api.port
        }),
        (e) => {
            fastify.log.error(e)
            process.exit(1)
        }
    )