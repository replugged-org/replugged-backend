import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UserFlags } from '../../flags.js'
import crudModule from './crud.js'
import { deleteUser, formatUser, UserDeletionCause } from '../../data/user.js'


// @ts-ignore
function searchUsers (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) { // eslint-disable-line
  // todo
}

// @ts-ignore
function banUser (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) { // eslint-disable-line
  // todo
}

// @ts-ignore
function refreshUserPledge (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) { // eslint-disable-line
  // todo
}

export default async function (fastify: FastifyInstance): Promise<void> {
  // Main routes

  // @ts-ignore
  fastify.register(crudModule, {
    data: {
      entity: {
        collection: 'users',
        stringId: true,
        baseQuery: { flags: { $bitsAllClear: UserFlags.GHOST } },
      },
      read: {
        enabled: true,
        allowAll: true,
        auth: { permissions: UserFlags.STAFF },
        format: (u: any) => formatUser(u, true, true),
      },
      create: { enabled: false },
      update: { enabled: true },
      delete: {
        enabled: true,
        auth: { permissions: UserFlags.STAFF },
        executor: (userId: string) => deleteUser(fastify.mongo.client, userId.toString(), UserDeletionCause.ADMINISTRATOR),
      },
    },
  })

  // And some other ones
  fastify.get('/search', { schema: void 0 }, searchUsers)
  fastify.post('/:id(\\d{17,})/ban', { schema: void 0 }, banUser)
  fastify.post('/:id(\\d{17,})/refresh-pledge', { schema: void 0 }, refreshUserPledge)
}