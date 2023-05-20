import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { URL } from "url";
import { rename, unlink } from "fs/promises";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { STORAGE_FOLDER } from "../utils/misc.js";

const SETTINGS_UPLOAD_LIMIT = 1e8; // 100MB
const SETTINGS_UPLOAD_EYES = 1e6; // 1MB
export const SETTINGS_STORAGE_FOLDER = STORAGE_FOLDER("settings");

const locks = new Set<string>();

function retrieve(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): void {
  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER);
  if (!existsSync(file)) {
    return reply.callNotFound();
  }

  // todo: etag
  reply.header("content-type", "application/octet-stream");
  reply.send(createReadStream(file));
}

function upload(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): void {
  if (locks.has(request.user!._id)) {
    reply.code(409).send({ error: "Resource locked by another request currently processing." });
    return;
  }

  locks.add(request.user!._id);
  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER);
  const tmp = new URL(`${request.user!._id}.tmp`, SETTINGS_STORAGE_FOLDER);
  const stream = createWriteStream(tmp);
  request.raw.pipe(stream);
  request.raw.on("end", () => {
    if (stream.bytesWritten > SETTINGS_UPLOAD_EYES) {
      // todo: maybe emit notification for abuse monitoring
    }

    // todo: compute hash and store it for use as etag
    stream.close();
    rename(tmp, file).then(() => {
      locks.delete(request.user!._id);
      reply.code(201).send();
    });
  });
}

async function del(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (locks.has(request.user!._id)) {
    reply.code(409).send({ error: "Resource locked by another request currently processing." });
    return;
  }

  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER);
  if (!existsSync(file)) {
    return reply.callNotFound();
  }

  await unlink(file);
  reply.code(204).send();
}

export default function (fastify: FastifyInstance, _: unknown, done: () => void): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  fastify.addContentTypeParser("application/octet-stream", {}, () => void 0);

  fastify.route({
    method: "POST",
    url: "/",
    handler: upload,
    config: { auth: { allowClient: true } },
  });

  fastify.route({
    method: "GET",
    url: "/",
    handler: retrieve,
    bodyLimit: SETTINGS_UPLOAD_LIMIT,
    config: { auth: { allowClient: true } },
  });

  fastify.route({
    method: "DELETE",
    url: "/",
    handler: del,
    config: { auth: { allowClient: true } },
  });
  done();
}
