import type { FastifyInstance } from "fastify";
import itemsModule from "./items.js";

export default function (fastify: FastifyInstance, _: unknown, done: () => void): void {
  fastify.register(itemsModule, { prefix: "/" });
  done();
}
