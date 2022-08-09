import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DiscordEmbed } from '../../../../types/discord';
import { UserFlags } from '../../flags.js';

export type DatabaseTag = {
    _id: string
    content: string
    embed?: DiscordEmbed
};

type RouteParams = {
    id: string
}

type ReadAllQuery = {
    page: number
    limit: number
}

async function read (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: FastifyReply) {
  const entity = await this.mongo.db!.collection('tags').findOne({ _id: request.params.id });

  if (!entity) {
    reply.callNotFound();
    return;
  }

  return entity;
}

async function readAll (this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadAllQuery }>) {
  const page = (request.query.page ?? 1) - 1;
  const limit = request.query.limit ?? 50;

  const cursor = await this.mongo.db!.collection('tags').find({}, {
    limit,
    skip: page * limit
  });

  const res = await cursor.toArray();

  return {
    data: res,
    page
  };
}

async function update (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: FastifyReply) {
  const tag = await this.mongo.db!.collection('tags').findOne({ _id: request.params.id });
  if (!tag) {
    reply.callNotFound();
  }
}

async function del (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: FastifyReply) {
  const tag = await this.mongo.db!.collection('tags').findOne({ _id: request.params.id });

  if (!tag) {
    reply.callNotFound();
    return;
  }

    this.mongo.db!.collection('tags').deleteOne({ _id: request.params.id });
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: readAll,
    config: {
      auth: {
        permissions: UserFlags.STAFF
      }
    }
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: read,
    config: {
      auth: {
        permissions: UserFlags.STAFF
      }
    }
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    handler: del,
    config: {
      auth: {
        permissions: UserFlags.STAFF
      }
    }
  });

  fastify.route({
    method: 'PATCH',
    url: '/:id',
    handler: update,
    config: {
      auth: {
        permissions: UserFlags.STAFF
      }
    }
  });
}
