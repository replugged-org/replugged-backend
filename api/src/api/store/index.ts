import type { FastifyInstance } from "fastify";
// import { fetchSuggestions } from './suggestions.js'

import itemsModule from "./items.js";

export default function (fastify: FastifyInstance): void {
  fastify.register(itemsModule, { prefix: "/" });
}
