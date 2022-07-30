import type { FastifyInstance, FastifyRequest, FastifyReply, ConfiguredReply, FastifyContextConfig } from 'fastify'
import type { Filter } from 'mongodb'
import { ObjectId } from 'mongodb'

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

async function create () {
  // todo
  return null
}

async function read (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
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

async function readAll (this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadAllQuery, Params: RouteParams }>, reply: Reply) {
  const config = reply.context.config
  const page = (request.query.page ?? 1) - 1
  const limit = request.query.limit ?? 50

  const cursor = this.mongo.db!.collection(config.entity.collection).find(
    config.entity.baseQuery ?? {},
    { projection: config.entity.projection, limit: limit, skip: page * limit }
  )

  if (config.read.format) cursor.map(config.read.format)
  return cursor.toArray()
}

async function update () {
  // todo
  return null
}

async function del () {
  // todo
  return null
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