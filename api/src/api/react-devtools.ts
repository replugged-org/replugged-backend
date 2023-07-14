import { FastifyInstance } from "fastify";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { exists } from "../utils/misc.js";

async function getZip(): Promise<Buffer | null> {
  const fullPath = resolve("ReactDevTools.zip");
  if (!(await exists(fullPath))) return null;
  return readFile(fullPath);
}

export default function (fastify: FastifyInstance, _: unknown, done: () => void): void {
  fastify.get("/", async (_, reply) => {
    const zip = await getZip();
    if (!zip) {
      reply.callNotFound();
      return;
    }

    reply.type("zip");
    return zip;
  });

  done();
}
