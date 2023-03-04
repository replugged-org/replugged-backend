import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply
} from 'fastify';
import type {
  DatabaseUser,
  User
} from '../../../types/users';
import { createHash } from 'crypto';
import { UserFlags } from '../flags.js';
import config from '../config.js';

import settingsModule from './settings.js';
import { isGhostUser, formatUser } from '../data/user.js';
// import { refreshAuthTokens, toMongoFields } from '../utils/oauth.js';
import { notifyStateChange, refreshDonatorState } from '../utils/patreon.js';

const DATE_ZERO = new Date(0);

const ALLOWED_HOSTS = [
  'discord.com', 'ptb.discord.com', 'canary.discord.com',
  'discordapp.com', 'ptb.discordapp.com', 'canary.discordapp.com',
  'cdn.discordapp.com', 'media.discordapp.net'
];

async function sendUser (request: FastifyRequest, reply: FastifyReply, user: User, self?: boolean) {
  const etag = `W/"${createHash('sha256').update(config.secret).update(user._id).update((user.updatedAt ?? DATE_ZERO).toISOString()).digest('base64url')}"`;

  reply.header('cache-control', 'public, max-age=0, must-revalidate');
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send();
    return;
  }

  reply.header('etag', etag);
  return formatUser(user, self);
}

async function getUser (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  // Should be able to be accessed from Discord
  reply.header('Access-Control-Allow-Origin', '*');

  const user = await this.mongo.db!.collection<DatabaseUser>('users').findOne({ _id: request.params.id });
  if (!user || isGhostUser(user)) {
    return sendUser(request, reply, {
      _id: request.params.id,
      username: 'Herobrine',
      discriminator: '0001',
      avatar: null,
      flags: 0,
      accounts: <any>{},
      createdAt: DATE_ZERO
    });
  }

  // await refreshDonatorState(this.mongo.client, user)
  return sendUser(request, reply, user);
}

async function getSelf (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  return sendUser(request, reply, request.user!, true);
}

// this endpoint can only be used to modify perks, but implements checks as a generic update to follow REST semantics (and future-proofing)
type PatchSelfRequest = { TokenizeUser: User, Body: {} }
async function patchSelf (this: FastifyInstance, request: FastifyRequest<PatchSelfRequest>, reply: FastifyReply) {
  const update: Record<string, any> = { updatedAt: new Date() };
  const user = request.user!;

  if (!request.body || typeof request.body !== 'object') {
    reply.code(400).send({ error: 400,
      message: 'Invalid request body.' });
    return;
  }

  if ('cutiePerks' in request.body && request.body.cutiePerks && typeof request.body.cutiePerks === 'object') {
    const pledgeTier = user.flags & UserFlags.IS_CUTIE ? user.cutieStatus?.pledgeTier ?? 1 : 0;
    if (('color' in request.body.cutiePerks && !pledgeTier) || (('badge' in request.body.cutiePerks || 'title' in request.body.cutiePerks) && pledgeTier < 2)) {
      reply.code(402).send({ error: 402,
        message: 'You must be a donator of a higher tier to modify these perks.' });
      return;
    }

    // Validate URL - todo: file upload?
    if ('badge' in request.body.cutiePerks && typeof request.body.cutiePerks.badge === 'string') {
      try {
        const icon = new URL(request.body.cutiePerks.badge);
        if (!ALLOWED_HOSTS.includes(icon.hostname)) {
          reply.code(400).send({ error: 400,
            message: 'Icon URL is not from a whitelisted source. Allowed URLs: *.discord.com, *.discordapp.com, media.discordapp.net' });
          return;
        }

        icon.protocol = 'https'; // Ensure protocol is https
        request.body.cutiePerks.badge = icon.toString();
      } catch {
        reply.code(400).send({ error: 400,
          message: 'Icon URL is malformed.' });
        return;
      }
    }

    if ('color' in request.body.cutiePerks) {
      update['cutiePerks.color'] = request.body.cutiePerks.color;
    }
    if ('badge' in request.body.cutiePerks) {
      update['cutiePerks.badge'] = request.body.cutiePerks.badge;
    }
    if ('title' in request.body.cutiePerks) {
      update['cutiePerks.title'] = request.body.cutiePerks.title;
    }
  }

  const result = await this.mongo.db!.collection<DatabaseUser>('users').findOneAndUpdate({ _id: request.user!._id }, { $set: update }, { returnDocument: 'after' });
  const newUser = result.value as User; // Cast is safe because the user is authenticated
  reply.send(formatUser(newUser, true));
  notifyStateChange(newUser, 'perks');
}

// async function getSpotifyToken (this: FastifyInstance, request: FastifyRequest): Promise<unknown> {
//   const { spotify } = request.user!.accounts;
//   if (!spotify) {
//     return { token: null };
//   }

//   const users = this.mongo.db!.collection<DatabaseUser>('users');
//   if (Date.now() >= spotify.expiresAt) {
//     try {
//       const tokens = await refreshAuthTokens('spotify', spotify.refreshToken);
//       await users.updateOne({ _id: request.user!._id }, { $currentDate: { updatedAt: true },
//         $set: toMongoFields(tokens, 'spotify') });
//       return { token: tokens.accessToken };
//     } catch {
//       // todo: catch 5xx errors from spotify and report them instead
//       await users.updateOne({ _id: request.user!._id }, { $currentDate: { updatedAt: true },
//         $unset: { 'accounts.spotify': 1 } });
//       return { token: null,
//         revoked: 'ACCESS_DENIED' };
//     }
//   }

//   return { token: spotify.accessToken };
// }

async function refreshPledge (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const patreonAccount = request.user!.accounts.patreon;
  const lastManualRefresh = request.user!.cutieStatus?.lastManualRefresh ?? 0;
  if (!patreonAccount) {
    reply.code(422).send({ error: 422,
      message: 'This operation requires a linked Patreon account' });
    return;
  }

  if (request.user!.flags & UserFlags.CUTIE_OVERRIDE) {
    reply.code(422).send({ error: 422,
      message: 'Your pledge status is currently managed by Powercord Staff. Contact us for help.' });
    return;
  }

  // 1 refresh per hour
  if (Date.now() - lastManualRefresh < 3600e3) {
    reply.code(429).send({ error: 429,
      message: 'A refresh already was requested within the previous hour. Try again later.' });
    return;
  }

  await refreshDonatorState(this.mongo.client, request.user!, true);
  reply.send(request.user!.cutieStatus || null);
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: 'GET',
    url: '/@me',
    handler: getSelf,
    config: { auth: { allowClient: true } }
  });

  // fastify.route({
  //   method: 'GET',
  //   url: '/@me/spotify',
  //   handler: getSpotifyToken,
  //   config: { auth: { allowClient: true } }
  // });

  fastify.route({
    method: 'GET',
    url: '/:id(\\d{17,})',
    handler: getUser
  });

  fastify.route({
    method: 'PATCH',
    url: '/@me',
    handler: patchSelf,
    config: { auth: { allowClient: true } }
    // schema: {
    //   body: { $ref: 'https://powercord.dev/schemas/user/update' },
    //   response: {
    //     200: { $ref: 'https://powercord.dev/schemas/user' }
    //     // todo: 4xx
    //   }
    // }
  });

  fastify.route({
    method: 'POST',
    url: '/@me/refresh-pledge',
    handler: refreshPledge,
    config: { auth: { allowClient: true } }
    // schema: {
    //   response: {
    //     200: { $ref: 'https://powercord.dev/schemas/user#/properties/cutieStatus' }
    //     // todo: 4xx
    //   }
    // }
  });

  fastify.register(settingsModule, { prefix: '/@me/settings' });
}
