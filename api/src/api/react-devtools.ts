import { FastifyInstance } from "fastify";
import { readFile, stat } from "fs/promises";
import { resolve } from "path";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

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
