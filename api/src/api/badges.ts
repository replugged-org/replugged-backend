import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createHash } from "crypto";

interface Badge {
  _id: string;
  name: string;
  icon: string;
}
type RestBadge = Omit<Badge, "_id">;

async function getGuildBadges(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // todo: revise storage method and check donator status of badge manager
  const hash = createHash("sha256");
  const cursor = this.mongo.db!.collection<Badge>("badges").find();
  const badges: Record<string, RestBadge> = {};
  for await (const badge of cursor) {
    hash.update(badge._id).update(badge.name).update(badge.icon);
    badges[badge._id] = { name: badge.name, icon: badge.icon };
  }

  cursor.close();
  const etag = `W/"${hash.digest("base64url")}"`;
  reply.header("cache-control", "public, max-age=600");
  if (request.headers["if-none-match"] === etag) {
    reply.code(304).send();
    return;
  }

  reply.send(badges);
}

export default function (fastify: FastifyInstance): void {
  fastify.get("/guilds", getGuildBadges);
}
