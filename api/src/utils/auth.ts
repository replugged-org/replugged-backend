import {
    type FastifyInstance,
    type FastifyReply
} from 'fastify'
import {
    type User
} from '../../../types/users'
import { createHash } from 'crypto'
import config from '../../../shared/config.js'
import { UserFlags } from '../../../shared/flags';
import { createSigner, createVerifier } from 'fast-jwt'

export type JWTPayload = { id: string };

export enum TokenType { WEB, CLIENT }

const KEY = createHash('sha512').update(config.secret).digest();

const Verifiers = {
    web: createVerifier({
        key: KEY,
        algorithms: ['HS512'],
        allowedAud: 'replugged:web',
        allowedIss: 'replugged:api:v1'
    }),
    client: createVerifier({
        key: KEY,
        algorithms: ['HS512'],
        allowedAud: ['replugged:web', 'replugged:client'],
        allowedIss: 'replugged:api:v1'
    })
}

function generateToken(this: FastifyReply, payload: JWTPayload, type: TokenType) {
    const signer = createSigner({
        key: KEY,
        algorithm: 'HS512',
        iss: 'replugged:api:v3',
        aud: type === TokenType.WEB ? 'replugged:web' : 'replugged:client',
        expiresIn: type === TokenType.WEB ? 24 * 3600e3 : void 0,
    })

    return signer(payload)
}

export default async function authPlugin(fastify: FastifyInstance) {
    fastify.decorateReply('generateToken', generateToken)
    fastify.addHook('onRequest', async function (this: FastifyInstance, request, reply) {
        request.jwtPayload = null
        request.user = null

        if (!reply.context.config.auth) return
        const { optional, permissions, allowClient } = reply.context.config.auth

        // Check cookies (web) and authorization (client)
        const token = request.cookies.token || request.headers.authorization
        if (!token) {
            if (!optional) {
                reply.code(401)
                throw new Error('Unauthorized')
            }

            return
        }

        try {
            request.jwtPayload = allowClient
                ? Verifiers.client(token)
                : Verifiers.web(token)
        } catch {
            if (!optional) {
                reply.code(401)
                throw new Error('Unauthorized')
            }

            return
        }

        // eslint-disable-next-line require-atomic-updates
        request.user = await this.mongo.db!.collection<User>('users').findOne({
            _id: request.jwtPayload!.id,
            flags: { $bitsAllClear: UserFlags.GHOST | UserFlags.BANNED },
        })

        if (!request.user) {
            if (!optional) {
                reply.code(401)
                throw new Error('Unauthorized')
            }

            return
        }

        if (permissions && (request.user!.flags & permissions) === 0) {
            reply.code(403)
            throw new Error('Insufficient permission')
        }

        // todo: update user data if necessary - refreshUserData
    })
}
