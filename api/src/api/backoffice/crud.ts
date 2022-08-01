import type { FastifyInstance, FastifyRequest, FastifyReply, ConfiguredReply, FastifyContextConfig } from 'fastify'
import type { Filter } from 'mongodb'
import { ObjectId } from 'mongodb'
import { UserFlagKeys, UserFlags } from '../../flags.js'
import { User } from '../../../../types/users'
import { GuildBadge } from '../../../../types/guild'
// import { deleteUser } from '../../data/user.js';
// import { fetchMember, addRole, removeRole } from '../utils/discord.js'


type CrudModule<TProps = {}> =
  | ({ enabled: false } & Partial<TProps>)
  | (TProps & { enabled: true, auth: Exclude<FastifyContextConfig['auth'], undefined> })

export type CrudSettings<TEntity> = {
  entity: {
    collection: string
    stringId?: boolean
    baseQuery?: Filter<TEntity>
    projection: { [key: string]: 0 | 1 }
  }
  create: CrudModule<{
    schema: unknown
    executor?: (data: any) => Promise<TEntity | null>
    post?: (data: TEntity) => void
  }>
  read: CrudModule<{
    schema: unknown
    allowAll?: boolean
    format?: (entity: TEntity) => any
  }>
  update: CrudModule<{
    schema: unknown
    hasUpdatedAt?: boolean
    executor?: (data: any) => Promise<TEntity | null>
    post?: (data: TEntity) => void
  }>
  delete: CrudModule<{
    executor?: (id: string | ObjectId) => Promise<void>
    post?: (data: TEntity) => void
  }>
}

type Reply = ConfiguredReply<FastifyReply, CrudSettings<any>>

type RouteParams = { id: string }

type ReadAllQuery = { limit?: number, page?: number }

async function create() {
  // todo
  return null
}

async function read(this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
  const config = reply.context.config
  const filter = {
    ...config.entity.baseQuery ?? {},
    _id: config.entity.stringId ? request.params.id : new ObjectId(request.params.id),
  }

  const entity = await this.mongo.db!.collection(config.entity.collection).findOne(filter, { projection: config.entity.projection })
  if (!entity) {
    reply.callNotFound()
    return
  }

  return config.read.format ? config.read.format(entity) : entity
}

async function readAll(this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadAllQuery, Params: RouteParams }>, reply: Reply) {
  const config = reply.context.config
  const page = (request.query.page ?? 1) - 1
  const limit = request.query.limit ?? 50

  const cursor = this.mongo.db!.collection(config.entity.collection).find(
    config.entity.baseQuery ?? {},
    { projection: config.entity.projection, limit: limit, skip: page * limit }
  )

  if (config.read.format) cursor.map(config.read.format)

  const res = await cursor.toArray();

  return {
    data: res,
    page: page
  }
}

type UpdateData = {
  patronTier: 0
  'badges.developer': Boolean
  'badges.staff': Boolean
  'badges.support': Boolean
  'badges.contributor': Boolean
  'badges.hunter': Boolean
  'badges.early': Boolean
  'badges.translator': Boolean
  'badges.custom.color': string | null
  'badges.custom.icon': string | null
  'badges.custom.name': string | null
  'badges.guild.id': string | null,
  'badges.guild.icon': string | null,
  'badges.guild.name': string | null
}

export function toggleFlags(existingFlags: number, flag: UserFlagKeys, setTo: Boolean) {
  if ((existingFlags & UserFlags[flag]) !== 0 && setTo === false) {
    existingFlags ^= UserFlags[flag]
  } else if ((existingFlags & UserFlags[flag]) === 0 && setTo === true) {
    existingFlags ^= UserFlags[flag]
  }

  return existingFlags;
}

async function update(this: FastifyInstance, request: FastifyRequest, reply: Reply) {
  const data = request.body as UpdateData
  const config = reply.context.config;
  const params = request.params as { id: string }

  const user = await this.mongo.db!.collection<User>(config.entity.collection).findOne({ _id: params.id });

  
  if (!user) return { code: 404, message: 'User does not exist' }
  // const existingFlags = user.flags
  let existingFlags = user.flags

  let mongoData: Partial<User> = {
    flags: existingFlags,
    cutiePerks: user?.cutiePerks
  }
  // todo: add or remove from existing flags.
  existingFlags = toggleFlags(existingFlags, 'DEVELOPER' as UserFlagKeys, data['badges.developer'])
  existingFlags = toggleFlags(existingFlags, 'STAFF' as UserFlagKeys, data['badges.staff'])
  existingFlags = toggleFlags(existingFlags, 'SUPPORT' as UserFlagKeys, data['badges.support'])
  existingFlags = toggleFlags(existingFlags, 'CONTRIBUTOR' as UserFlagKeys, data['badges.contributor'])
  existingFlags = toggleFlags(existingFlags, 'BUG_HUNTER' as UserFlagKeys, data['badges.hunter'])
  existingFlags = toggleFlags(existingFlags, 'EARLY_USER' as UserFlagKeys, data['badges.early'])
  existingFlags = toggleFlags(existingFlags, 'TRANSLATOR' as UserFlagKeys, data['badges.translator'])

  if (data['badges.custom.color'] !== null) {
    // @ts-ignore
    mongoData.cutiePerks = {
      ...mongoData.cutiePerks,
      color: data['badges.custom.color']
    }
  }

  if (data['badges.custom.icon'] !== null) {
    // @ts-ignore
    mongoData.cutiePerks = {
      ...mongoData.cutiePerks,
      badge: data['badges.custom.icon'].replace(/#/g, '')
    }

    if (!data['badges.custom.color'] || !mongoData.cutiePerks?.color) {
      // @ts-ignore
      mongoData.cutiePerks = {
        ...mongoData.cutiePerks,
        color: '7289da'
      }
    }
  }

  if (data['badges.guild.id'] && data['badges.guild.icon'] && data['badges.guild.name']) {
    // @ts-ignore
    mongoData.cutiePerks = {
      ...mongoData.cutiePerks,
      guild: {
        id: data['badges.guild.id']
      }
    }

    const existingGuild = await this.mongo.db!.collection('badges').findOne({ userId: params.id })


    if (!existingGuild) {
      this.mongo.db!.collection<GuildBadge>('badges').insertOne({
        _id: data['badges.guild.id'],
        userId: params.id,
        name: data['badges.guild.name'],
        badge: data['badges.guild.icon']
      })

    } else {
      this.mongo.db!.collection<GuildBadge>('badges').updateOne({ userId: params.id }, {
        $set: {
          _id: data['badges.guild.id'],
          name: data['badges.guild.name'],
          badge: data['badges.guild.icon']
        }
      })
    }
  }

  if (data['badges.custom.name'] !== null) {
    // @ts-ignore
    mongoData.cutiePerks = {
      ...mongoData.cutiePerks,
      title: data['badges.custom.name']
    }

    if (!data['badges.custom.color'] || !mongoData.cutiePerks?.color) {
      // @ts-ignore
      mongoData.cutiePerks = {
        ...mongoData.cutiePerks,
        color: '7289da'
      }
    }
  }

  this.mongo.db!.collection(config.entity.collection).updateOne({ _id: params.id }, { $set: { ...mongoData } })

  // todo
  return { data: 'test' }
}

async function del(this: FastifyInstance, request: FastifyRequest, reply: Reply) {
  // todo
  const config = reply.context.config;
  const userId = (request.params as { id: string }).id

  const user = await this.mongo.db!.collection(config.entity.collection).findOne({ _id: userId })

  if (!user) {
    return { deleted: false }
  }

  if (user.flags & UserFlags.STORE_PUBLISHER) {
    return { deleted: false }
  }

  this.mongo.db!.collection(config.entity.collection).deleteOne({ _id: userId })

  return {
    deleted: true
  }
}

export default function (fastify: FastifyInstance, { data }: { data: CrudSettings<any> }, next: (err?: Error) => void) {

  if (data.create.enabled) {
    fastify.route({
      method: 'POST',
      url: '/',
      handler: create,
      config: { ...data, auth: data.create.auth },
    })
  }

  if (data.read.enabled && data.read.allowAll) {
    fastify.route({
      method: 'GET',
      url: '/',
      handler: readAll,
      config: { ...data, auth: data.read.auth },
    })
  }

  if (data.read.enabled) {
    fastify.route({
      method: 'GET',
      url: '/:id',
      handler: read,
      config: { ...data, auth: data.read.auth },
    })
  }

  if (data.update.enabled) {
    fastify.route({
      method: 'PATCH',
      url: '/:id',
      handler: update,
      config: { ...data, auth: data.update.auth },
    })
  }

  if (data.delete.enabled) {
    fastify.route({
      method: 'DELETE',
      url: '/:id',
      handler: del,
      config: { ...data, auth: data.delete.auth },
    })
  }

  next()
}