import type { FastifyInstance } from "fastify";
import { readFile, readdir } from "fs/promises";
import path from "path";
import type { StoreItem } from "../../../../types/store.js";
import { STORAGE_FOLDER, exists, toArray } from "../../utils/misc.js";

const ADDONS_FOLDER = STORAGE_FOLDER("addons");

const ADDON_TYPES = ["plugin", "theme"] as const;
type AddonType = (typeof ADDON_TYPES)[number];

const manifestCache = new Map<string, StoreItem>();
const CACHE_DURATION = 1000 * 60 * 1;

async function getManifest(id: string): Promise<StoreItem | null> {
  if (manifestCache.has(id)) {
    return manifestCache.get(id)!;
  }
  return await loadManifest(id);
}
async function loadManifest(id: string): Promise<StoreItem | null> {
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

function listAddons(type: AddonType, query?: string | undefined): StoreItem[] {
  const addons = Array.from(manifestCache.values())
    .filter((x) => x.type === `replugged-${type}`)
    .sort((a, b) => a.name.localeCompare(b.name));

  const normalize = (str: string): string => str.toLowerCase().trim().replace(/\s+/g, " ");
  const normalizedQuery = normalize(query || "");

  const filteredAddons = query
    ? addons
        .filter((x) =>
          [x.name, x.description, ...toArray(x.author).map((x) => x.name)].some((x) =>
            normalize(x).includes(normalizedQuery),
          ),
        )
        .sort((a, b) => {
          // "Relevance" sorting
          // Prioritize name matches, then names that start with the query, then description matches

          const aNameMatch = normalize(a.name).includes(normalizedQuery);
          const bNameMatch = normalize(b.name).includes(normalizedQuery);
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;

          const aNameStartsWith = normalize(a.name).startsWith(normalizedQuery);
          const bNameStartsWith = normalize(b.name).startsWith(normalizedQuery);
          if (aNameStartsWith && !bNameStartsWith) return -1;
          if (!aNameStartsWith && bNameStartsWith) return 1;

          const aDescMatch = normalize(a.description).includes(normalizedQuery);
          const bDescMatch = normalize(b.description).includes(normalizedQuery);
          if (aDescMatch && !bDescMatch) return -1;

          return 0;
        })
    : addons;

  return filteredAddons;
}

async function getAddonIdsFromDisk(): Promise<string[]> {
  const fullPath = path.join(ADDONS_FOLDER, "manifests");
  if (!(await exists(fullPath))) return [];
  const fileNames = await readdir(fullPath);
  return fileNames.map((fileName) => fileName.replace(/\.json$/, ""));
}

async function populateCache(): Promise<void> {
  const ids = await getAddonIdsFromDisk();
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
      items?: string;
      query?: string;
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
    const perPage = parseInt(request.query.items ?? "10", 10);
    if (isNaN(perPage) || perPage % 1 !== 0 || perPage < 1) {
      reply.code(400).send({
        error: `Invalid items per page: ${request.query.items}`,
      });
      return;
    }
    if (perPage > 100) {
      reply.code(400).send({
        error: `Items per page cannot be greater than 100`,
      });
      return;
    }

    const manifests = listAddons(type, request.query.query);
    const numPages = Math.ceil(manifests.length / perPage);
    if (page > numPages) {
      reply.code(404).send({
        error: "NOT_FOUND",
      });
      return;
    }

    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      page,
      numPages,
      results: manifests.slice(start, end),
    };
  });
  done();
}
