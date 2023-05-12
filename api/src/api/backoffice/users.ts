import type {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import {UserFlagKeys, UserFlags} from '../../flags.js';
import {formatUser} from '../../data/user.js';
import {User} from '../../../../types/users.js';
import {GuildBadge} from '../../../../types/guild';

type RouteParams = {id: string};
type ReadAllQuery = {limit?: number; page?: number};

type UpdateData = {
	patronTier: 0;
	'badges.developer': boolean;
	'badges.staff': boolean;
	'badges.support': boolean;
	'badges.contributor': boolean;
	'badges.hunter': boolean;
	'badges.early': boolean;
	'badges.translator': boolean;
	'badges.custom.color': string | null;
	'badges.custom.icon': string | null;
	'badges.custom.name': string | null;
	'badges.guild.id': string | null;
	'badges.guild.icon': string | null;
	'badges.guild.name': string | null;
};

// @ts-ignore
function searchUsers(
	this: FastifyInstance,
	_request: FastifyRequest,
	_reply: FastifyReply,
) {
	// eslint-disable-line
	// todo
}

// @ts-ignore
function banUser(
	this: FastifyInstance,
	_request: FastifyRequest,
	_reply: FastifyReply,
) {
	// eslint-disable-line
	// todo
}

// @ts-ignore
function refreshUserPledge(
	this: FastifyInstance,
	_request: FastifyRequest,
	_reply: FastifyReply,
) {
	// eslint-disable-line
	// todo
}

async function read(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
	reply: FastifyReply,
) {
	const filter = {
		flags: {$bitsAllClear: UserFlags.GHOST},
		_id: request.params.id,
	};

	const entity = await this.mongo
		.db!.collection<User>('users')
		.findOne(filter);

	if (!entity) {
		reply.callNotFound();
		return;
	}

	return formatUser(entity, true, true);
}

async function readAll(
	this: FastifyInstance,
	request: FastifyRequest<{Querystring: ReadAllQuery}>,
) {
	const page = (request.query.page ?? 1) - 1;
	const limit = request.query.limit ?? 50;

	const cursor = this.mongo.db!.collection<User>('users').find(
		{},
		{
			limit,
			skip: page * limit,
		},
	);

	cursor.map(u => formatUser(u, true, true));

	const res = await cursor.toArray();

	return {
		data: res,
		page,
	};
}

async function del(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
	reply: FastifyReply,
) {
	const userId = request.params.id;

	const user = await this.mongo
		.db!.collection<User>('users')
		.findOne({_id: userId});

	if (!user) {
		reply.callNotFound();
		return;
	}

	if (user.flags & UserFlags.STORE_PUBLISHER) {
		return {deleted: false};
	}

	this.mongo.db!.collection<User>('users').deleteOne({_id: userId});

	return {deleted: true};
}

function toggleFlags(
	existingFlags: number,
	flag: UserFlagKeys,
	setTo: Boolean,
) {
	let newFlags = existingFlags;
	if ((existingFlags & UserFlags[flag]) !== 0 && setTo === false) {
		newFlags ^= UserFlags[flag];
	} else if ((existingFlags & UserFlags[flag]) === 0 && setTo === true) {
		newFlags ^= UserFlags[flag];
	}

	return newFlags;
}

async function update(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
	reply: FastifyReply,
) {
	const data = request.body as UpdateData;

	const user = await this.mongo
		.db!.collection<User>('users')
		.findOne({_id: request.params.id});

	if (!user) {
		reply.callNotFound();
		return;
	}
	// const existingFlags = user.flags

	const mongoData: Partial<User> = {
		flags: user.flags ?? 0,
		cutiePerks: user?.cutiePerks,
	};

	// todo: add or remove from existing flags.
	mongoData.flags = toggleFlags(
		mongoData.flags!,
		'DEVELOPER' as UserFlagKeys,
		data['badges.developer'],
	);
	mongoData.flags = toggleFlags(
		mongoData.flags,
		'STAFF' as UserFlagKeys,
		data['badges.staff'],
	);
	mongoData.flags = toggleFlags(
		mongoData.flags,
		'SUPPORT' as UserFlagKeys,
		data['badges.support'],
	);
	mongoData.flags = toggleFlags(
		mongoData.flags,
		'CONTRIBUTOR' as UserFlagKeys,
		data['badges.contributor'],
	);
	mongoData.flags = toggleFlags(
		mongoData.flags,
		'BUG_HUNTER' as UserFlagKeys,
		data['badges.hunter'],
	);
	mongoData.flags = toggleFlags(
		mongoData.flags,
		'EARLY_USER' as UserFlagKeys,
		data['badges.early'],
	);
	mongoData.flags = toggleFlags(
		mongoData.flags,
		'TRANSLATOR' as UserFlagKeys,
		data['badges.translator'],
	);

	if (data.patronTier >= 1) {
		mongoData.cutieStatus = {
			pledgeTier: data.patronTier,
			perksExpireAt: Date.now() + 2.628e9, // basically just adds a month of donator status
		};

		mongoData.flags ^= UserFlags.CUTIE_OVERRIDE;
	}

	if (data.patronTier === 0) {
		mongoData.cutieStatus = {
			pledgeTier: data.patronTier,
			perksExpireAt: Date.now(),
		};

		mongoData.flags ^= UserFlags.CUTIE_OVERRIDE;
	}

	if (data['badges.custom.color'] !== null) {
		// @ts-ignore
		mongoData.cutiePerks = {
			...mongoData.cutiePerks,
			color: data['badges.custom.color'],
		};
	}

	if (data['badges.custom.icon'] !== null) {
		// @ts-ignore
		mongoData.cutiePerks = {
			...mongoData.cutiePerks,
			badge: data['badges.custom.icon'].replace(/#/g, ''),
		};

		if (!data['badges.custom.color'] || !mongoData.cutiePerks?.color) {
			// @ts-ignore
			mongoData.cutiePerks = {
				...mongoData.cutiePerks,
				color: '7289da',
			};
		}
	}

	if (
		data['badges.guild.id'] &&
		data['badges.guild.icon'] &&
		data['badges.guild.name']
	) {
		// @ts-ignore
		mongoData.cutiePerks = {
			...mongoData.cutiePerks,
			guild: {
				id: data['badges.guild.id'],
			},
		};

		const existingGuild = await this.mongo
			.db!.collection('badges')
			.findOne({userId: request.params.id});

		if (!existingGuild) {
			this.mongo.db!.collection<GuildBadge>('badges').insertOne({
				_id: data['badges.guild.id'],
				userId: request.params.id,
				name: data['badges.guild.name'],
				badge: data['badges.guild.icon'],
			});
		} else {
			this.mongo.db!.collection<GuildBadge>('badges').updateOne(
				{userId: request.params.id},
				{
					$set: {
						_id: data['badges.guild.id'],
						name: data['badges.guild.name'],
						badge: data['badges.guild.icon'],
					},
				},
			);
		}
	}

	if (data['badges.custom.name'] !== null) {
		// @ts-ignore
		mongoData.cutiePerks = {
			...mongoData.cutiePerks,
			title: data['badges.custom.name'],
		};

		if (!data['badges.custom.color'] || !mongoData.cutiePerks?.color) {
			// @ts-ignore
			mongoData.cutiePerks = {
				...mongoData.cutiePerks,
				color: '7289da',
			};
		}
	}

	this.mongo
		.db!.collection<User>('users')
		.updateOne({_id: request.params.id}, {$set: {...mongoData}});

	// todo
	return {data: 'test'};
}

async function readGuildBadge(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
	reply: FastifyReply,
) {
	const entity = await this.mongo
		.db!.collection('badges')
		.findOne({userId: request.params.id});

	if (!entity) {
		reply.callNotFound();
		return;
	}

	return entity;
}

async function getUserCount(this: FastifyInstance) {
	const users = await this.mongo.db!.collection('users').countDocuments();
	return users;
}

export default async function (fastify: FastifyInstance): Promise<void> {
	// Main routes

	fastify.route({
		method: 'GET',
		url: '/',
		handler: readAll,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});

	fastify.route({
		method: 'GET',
		url: '/count',
		handler: getUserCount,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});

	fastify.route({
		method: 'GET',
		url: '/:id',
		handler: read,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});

	fastify.route({
		method: 'GET',
		url: '/perks/guild/:id',
		handler: readGuildBadge,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});

	fastify.route({
		method: 'DELETE',
		url: '/:id',
		handler: del,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});

	fastify.route({
		method: 'PATCH',
		url: '/:id',
		handler: update,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});

	// And some other ones
	fastify.get('/search', {schema: void 0}, searchUsers);
	fastify.post('/:id(\\d{17,})/ban', {schema: void 0}, banUser);
	fastify.post(
		'/:id(\\d{17,})/refresh-pledge',
		{schema: void 0},
		refreshUserPledge,
	);
}
