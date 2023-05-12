import {FastifyInstance} from 'fastify';
import {STORAGE_FOLDER} from '../../utils/misc.js';
import path from 'path';
import {stat, readFile, readdir} from 'fs/promises';

async function exists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

const ADDONS_FOLDER = STORAGE_FOLDER('addons');
const RESULTS_PER_PAGE = 20;

const ADDON_TYPES = ['plugin', 'theme'] as const;
type AddonType = (typeof ADDON_TYPES)[number];
type Manifest = Record<string, unknown>; // TODO: possibly type this

async function getManifest(
	type: AddonType,
	id: string,
): Promise<Manifest | null> {
	const fullPath = path.join(ADDONS_FOLDER, 'manifests', type, `${id}.json`);
	if (!(await exists(fullPath))) return null;
	const manifestContent = await readFile(fullPath, 'utf-8');
	return JSON.parse(manifestContent);
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
}
