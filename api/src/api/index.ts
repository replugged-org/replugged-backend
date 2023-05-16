import type { FastifyInstance } from "fastify";
import v1Mod from "./v1.js";

export default function (fastify: FastifyInstance): void {
  fastify.register(v1Mod, { prefix: "/v1" });
  fastify.register(v1Mod, { prefix: "/" });
}
