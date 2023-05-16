import type { FastifyInstance } from "fastify";

import usersModule from "./users.js";
import formsModule from "./forms.js";
import tagsModule from "./tags.js";

export default function (fastify: FastifyInstance): void {
  fastify.register(usersModule, { prefix: "/users" });
  // abuse monitoring

  // store frontpage
  fastify.register(formsModule, { prefix: "/forms" });

  // boat tags
  fastify.register(tagsModule, { prefix: "/tags" });

  // store reports

  // super secret event
}
