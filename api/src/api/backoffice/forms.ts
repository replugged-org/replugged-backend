import type {User} from '../../../../types/users';
import type {StoreForm} from '../../../../types/store';
import type {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import config from '../../config.js';
import {
	dispatchHonk,
	editHonkMessage,
	fetchHonkMessage,
	sendDm,
} from '../../utils/discord.js';
import {UserFlags} from '../../flags.js';

const DmMessages = {
	publish: {
		approved:
			'Your submission in the Replugged Store has been approved! You should see it appear in the "Management > My works" tab of the Replugged Store shortly, the time it\'ll take Replugged Staff to prepare everything.\n\nIf your submission is a plugin, you will receive an invitation to a repository in the replugged-community organization that will be the new home of your plugin. Make sure to push future updates to this repository!',
		rejected:
			'Unfortunately, your submission in the Replugged Store has been rejected for the following reason: $reason\n\nMake sure your plugin follows the Replugged Guidelines available at <https://replugged.dev/guidelines> and that it is in a functional shape before submitting again.',
	},
	verification: {
		approved:
			'Your verification request has been approved! Your plugin now has the verified tickmark in the Store, and you have unlocked the Verified Developer role in our support server.',
		rejected:
			'Unfortunately, we rejected your verification request for the following reason: $reason\n\nWe want verified works to be the best-of-the-best, and we tend to be nitpick-y in our review process. Make sure your work meets the eligibility criteria for verification, and make sure to solve the outlined points before submitting again.',
	},
	hosting: {
		approved:
			'Your request for hosting a backend has been approved. A Replugged Developer will get in touch soon to prepare your backend for hosting on our servers.',
		rejected:
			'Unfortunately, we rejected your request for hosting a backend for the following reason: $reason',
	},
};

type RouteParams = {
	id: string;
};

async function update(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
	reply: FastifyReply,
) {
	const collection = this.mongo.db!.collection<StoreForm>('forms');
	const {id} = request.params;

	const query = request.body as Record<string, unknown>;

	const res = await collection.findOneAndUpdate(
		{_id: id},
		{$set: query},
		{
			returnDocument: 'after',
		},
	);

	console.log(res);

	if (!res.value) {
		return reply.callNotFound();
	}
	// eslint-disable-next-line no-use-before-define
	const resp = await Promise.resolve(
		finishFormUpdate(request, reply, res.value),
	);
	if (resp) {
		reply.code(200).send(resp);
		return;
	}

	reply.code(204).send();
}

async function finishFormUpdate(
	request: FastifyRequest,
	_reply: FastifyReply,
	form: StoreForm,
) {
	const user = request.user as User;
	const message = await fetchHonkMessage(
		config.discord.ids.formsChannelId,
		form.messageId,
	);

	const modMessage = form.approved
		? `Form **approved** by ${user.username}#${user.discriminator}`
		: `Form **rejected** by ${user.username}#${user.discriminator} for the following reason: ${form.reviewReason}`;

	const dmMessage = form.approved
		? DmMessages[form.kind].approved
		: DmMessages[form.kind].rejected;

	if (message.thread) {
		await dispatchHonk(
			config.discord.ids.formsChannelId,
			{content: modMessage},
			`thread_id=${message.thread.id}`,
		);
	} else {
		await editHonkMessage(config.discord.ids.formsChannelId, message.id, {
			content: `${message.content}\n\n${modMessage}`,
		});
	}

	const couldDm = await sendDm(
		form.submitter as unknown as string,
		`Hey $username,\n\n${dmMessage.replace(
			/$reason/g,
			form.reviewReason ?? '',
		)}\n\nCheers, \nReplugged Staff`,
	);

	return {couldDm};
}

const pendingFormQuery = {
	$or: [{reviewed: {$exists: false}}, {reviewed: {$eq: false}}],
};

async function getFormCount(this: FastifyInstance) {
	const res: Record<string, number> = {
		verification: 0,
		publish: 0,
		hosting: 0,
		reports: 0,
	};

	const forms = await this.mongo
		.db!.collection('forms')
		.aggregate([
			{$match: pendingFormQuery},
			{$group: {_id: '$kind', count: {$sum: 1}}},
		])
		.toArray();

	for (const form of forms) {
		res[form._id] = form.count;
	}

	return res;
}

type ReadAllQuery = {limit?: number; page?: number};

async function readAll(
	this: FastifyInstance,
	request: FastifyRequest<{Querystring: ReadAllQuery}>,
) {
	const page = (request.query.page ?? 1) - 1;
	const limit = request.query.limit ?? 50;

	const cursor = this.mongo.db!.collection<StoreForm>('forms').find(
		{},
		{
			limit,
			skip: page * limit,
		},
	);

	const res = await cursor.toArray();

	return {
		data: res,
		page,
	};
}

async function del(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
) {
	this.mongo
		.db!.collection<StoreForm>('forms')
		.deleteOne({_id: request.params.id});

	return {
		deleted: true,
	};
}

async function read(
	this: FastifyInstance,
	request: FastifyRequest<{Params: RouteParams}>,
	reply: FastifyReply,
) {
	const entity = await this.mongo
		.db!.collection<StoreForm>('forms')
		.findOne({_id: request.params.id});

	if (!entity) {
		reply.callNotFound();
		return;
	}

	return entity;
}

export default async function (fastify: FastifyInstance): Promise<void> {
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
		url: '/:id',
		handler: read,
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
		method: 'GET',
		url: '/count',
		handler: getFormCount,
		config: {
			auth: {
				permissions: UserFlags.STAFF,
			},
		},
	});
}
