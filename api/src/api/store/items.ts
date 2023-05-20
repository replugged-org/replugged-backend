import { FastifyInstance } from "fastify";
import { STORAGE_FOLDER } from "../../utils/misc.js";
import path from "path";
import { readFile, readdir, stat } from "fs/promises";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const ADDONS_FOLDER = STORAGE_FOLDER("addons");
const RESULTS_PER_PAGE = 20;

const ADDON_TYPES = ["plugin", "theme"] as const;
type AddonType = (typeof ADDON_TYPES)[number];
type Manifest = {
  id: string;
  name: string;
  type: "replugged-plugin" | "replugged-theme" | "replugged";
} & Record<string, unknown>; // TODO: possibly type this

const manifestCache = new Map<string, Manifest>();
const CACHE_DURATION = 1000 * 60 * 1;

async function getManifest(id: string): Promise<Manifest | null> {
  if (manifestCache.has(id)) {
    return manifestCache.get(id)!;
  }
  return await loadManifest(id);
}
async function loadManifest(id: string): Promise<Manifest | null> {
  const fullPath = path.join(ADDONS_FOLDER, "manifests", `${id}.json`);
  if (!(await exists(fullPath))) return null;
  const manifestContent = await readFile(fullPath, "utf-8");
  const json = JSON.parse(manifestContent);
  manifestCache.set(id, json);
  return json;
}

async function getAsar(id: string): Promise<Buffer | null> {
  const fullPath = path.join(ADDONS_FOLDER, "asars", `${id}.asar`);
  if (!(await exists(fullPath))) return null;
  return readFile(fullPath);
}

function listAddons(type: AddonType): Manifest[] {
  const addons = Array.from(manifestCache.values())
    .filter((x) => x.type === `replugged-${type}`)
    .sort((a, b) => a.name.localeCompare(b.name));

  return addons;
}

async function getAddonIdsFromDisc(): Promise<string[]> {
  const fullPath = path.join(ADDONS_FOLDER, "manifests");
  if (!(await exists(fullPath))) return [];
  const fileNames = await readdir(fullPath);
  return fileNames.map((fileName) => fileName.replace(/\.json$/, ""));
}

async function populateCache(): Promise<void> {
  const ids = await getAddonIdsFromDisc();
  Promise.all(ids.map((id) => loadManifest(id)));
}
populateCache();
setInterval(populateCache, CACHE_DURATION);

export default function (fastify: FastifyInstance, _: unknown, done: () => void): void {
  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id", async (request, reply) => {
    const manifest = await getManifest(request.params.id);
    if (!manifest) {
      reply.callNotFound();
      return;
    }
    return manifest;
  });

  fastify.get<{
    Params: {
      id: string;
    };
  }>("/:id.asar", async (request, reply) => {
    const asar = await getAsar(request.params.id);
    if (!asar) {
      reply.callNotFound();
      return;
    }
    return asar;
  });

  fastify.get<{
    Params: {
      type: string;
      id: string;
    };
    Querystring: {
      page?: string;
    };
  }>("/list/:type", (request, reply) => {
    // @ts-expect-error includes bs
    if (!ADDON_TYPES.includes(request.params.type.replace(/s$/, ""))) {
      reply.code(400).send({
        error: `Invalid addon type: ${request.params.type}`,
      });
      return;
    }
    const type = request.params.type.replace(/s$/, "") as AddonType;

    const page = parseInt(request.query.page ?? "1", 10);
    if (isNaN(page)) {
      reply.code(400).send({
        error: `Invalid page number: ${request.query.page}`,
      });
      return;
    }

    const manifests = listAddons(type);
    const numPages = Math.ceil(manifests.length / RESULTS_PER_PAGE);
    if (page > numPages) {
      reply.code(404).send({
        error: `Page ${page} not found`,
      });
      return;
    }

    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;

    return {
      page,
      numPages,
      results: manifests.slice(start, end),
    };
  });
  done();
}
