import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { GuildBadge } from "../../../types/guild";

interface Badge {
  name: string;
  icon: string;
}

function badges(
  this: FastifyInstance,
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<Record<string, Badge>> {
  reply.header("cache-control", "public, max-age=0, must-revalidate");
  return this.mongo
    .db!.collection<GuildBadge & { _id: string }>("badges")
    .find({})
    .toArray()
    .then((b) =>
      b.reduce<Record<string, Badge>>((acc, badge) => {
        acc[badge._id] = {
          name: badge.name,
          icon: badge.badge,
        };
        return acc;
      }, {}),
    );
}

/** @deprecated */
export default function (fastify: FastifyInstance): void {
  fastify.get("/badges", badges);
}
