import {FastifyInstance} from 'fastify';
import {STORAGE_FOLDER} from '../../utils/misc.js';
import path from 'path';
import {stat, readFile, readdir} from 'fs/promises';
import {z} from 'zod';

async function exists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

const updateCheckSchema = z.array(
	z.object({
		type: z.enum(['plugin', 'theme']),
		id: z.string(),
		version: z.string(),
	}),
);
type UpdateCheck = z.infer<typeof updateCheckSchema>;

const ADDONS_FOLDER = STORAGE_FOLDER('addons');
const RESULTS_PER_PAGE = 20;

const ADDON_TYPES = ['plugin', 'theme'] as const;
type AddonType = (typeof ADDON_TYPES)[number];
type Manifest = Record<string, unknown>; // TODO: possibly type this

const manifestCache = new Map<
	string,
	{
		data: Manifest;
		fetched: Date;
	}
>();
const CACHE_DURATION = 1000 * 60 * 1;

async function getManifest(
	type: AddonType,
	id: string,
): Promise<Manifest | null> {
	const cached = manifestCache.get(`${type}/${id}`);
	if (cached && cached.fetched.getTime() > Date.now() - CACHE_DURATION) {
		return cached.data;
	}
	return await loadManifest(type, id);
}
async function loadManifest(
	type: AddonType,
	id: string,
): Promise<Manifest | null> {
	const fullPath = path.join(ADDONS_FOLDER, 'manifests', type, `${id}.json`);
	if (!(await exists(fullPath))) return null;
	const manifestContent = await readFile(fullPath, 'utf-8');
	const json = JSON.parse(manifestContent);
	manifestCache.set(`${type}/${id}`, {
		data: json,
		fetched: new Date(),
	});
	return json;
}

async function getAsar(type: AddonType, id: string): Promise<Buffer | null> {
	const fullPath = path.join(ADDONS_FOLDER, 'asars', type, `${id}.asar`);
	if (!(await exists(fullPath))) return null;
	return readFile(fullPath);
}

async function listAddonIds(type: AddonType): Promise<string[]> {
	const fullPath = path.join(ADDONS_FOLDER, 'manifests', type);
	if (!(await exists(fullPath))) return [];
	const fileNames = await readdir(fullPath);
	return fileNames.map(fileName => fileName.replace(/\.json$/, ''));
}

async function getAddonsWithUpdates(
	updateCheck: UpdateCheck,
): Promise<UpdateCheck> {
	const results = await Promise.all(
		updateCheck.map(async addon => {
			const manifest = await getManifest(addon.type, addon.id);
			if (!manifest) return null;
			if (manifest.version === addon.version) return null;
			return {
				type: addon.type,
				id: addon.id,
				version: manifest.version as string,
			};
		}),
	);

	return results.filter(Boolean) as UpdateCheck;
}

async function populateCache() {
	const ids = await listAddonIds('plugin');
	Promise.all(ids.map(id => loadManifest('plugin', id)));
}
populateCache();
setInterval(populateCache, CACHE_DURATION);

export default async function (fastify: FastifyInstance): Promise<void> {
	fastify.get<{
		Params: {
			type: AddonType;
			id: string;
		};
	}>('/:type/:id', async (request, reply) => {
		if (!ADDON_TYPES.includes(request.params.type as AddonType)) {
			reply.code(400).send({
				error: `Invalid addon type: ${request.params.type}`,
			});
			return;
		}

		const manifest = await getManifest(
			request.params.type,
			request.params.id,
		);
		if (!manifest) {
			reply.callNotFound();
			return;
		}
		return manifest;
	});

	fastify.get<{
		Params: {
			type: AddonType;
			id: string;
		};
	}>('/:type/:id.asar', async (request, reply) => {
		if (!ADDON_TYPES.includes(request.params.type as AddonType)) {
			reply.code(400).send({
				error: `Invalid addon type: ${request.params.type}`,
			});
			return;
		}

		const asar = await getAsar(request.params.type, request.params.id);
		if (!asar) {
			reply.callNotFound();
			return;
		}
		return asar;
	});

	fastify.get<{
		Params: {
			type: AddonType;
			id: string;
		};
		Querystring: {
			page?: string;
		};
	}>('/:type', async (request, reply) => {
		if (!ADDON_TYPES.includes(request.params.type as AddonType)) {
			reply.code(400).send({
				error: `Invalid addon type: ${request.params.type}`,
			});
			return;
		}
		const page = parseInt(request.query.page ?? '1');
		if (isNaN(page)) {
			reply.code(400).send({
				error: `Invalid page number: ${request.query.page}`,
			});
			return;
		}

		const ids = await listAddonIds(request.params.type);
		const numPages = Math.ceil(ids.length / RESULTS_PER_PAGE);
		if (page > numPages) {
			reply.code(404).send({
				error: `Page ${page} not found`,
			});
			return;
		}

		const start = (page - 1) * RESULTS_PER_PAGE;
		const end = start + RESULTS_PER_PAGE;
		const slicedIds = ids.slice(start, end);
		const manifests = await Promise.all(
			slicedIds.map(id => getManifest(request.params.type, id)),
		);

		return {
			page,
			numPages,
			results: manifests,
		};
	});

	fastify.post('/updates', async (request, reply) => {
		const zodRes = updateCheckSchema.safeParse(request.body);
		if (!zodRes.success) {
			reply.code(400).send({
				error: 'Invalid request body',
				issues: zodRes.error.format(),
			});
			return;
		}

		const addons = await getAddonsWithUpdates(zodRes.data);
		return addons;
	});
}
