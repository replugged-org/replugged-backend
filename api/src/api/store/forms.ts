import { type Db } from 'mongodb';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { EligibilityStatus } from '../../../../types/store';
import type { User } from '../../../../types/users';
import { lookup } from 'dns';
import { fetch } from 'undici';
import config from '../../config.js';

import { dispatchHonk } from '../../utils/discord.js';

// todo: see if this can deduped easily, schemas also contain the structure
type PublishBody = {
  repoUrl: string
  bdAlternative: string
  reviewNotes: string
  complianceGuidelines: boolean
  complianceLegal: boolean
  type: string,
  descripion: string
}

type VerificationBody = {
  workUrl: string
  workAbout: string
  developerAbout: string
  workFuture: string
  why: string
  complianceCute: boolean
}

type HostingBody = {
  repoUrl: string
  purpose: string
  technical: string
  subdomain: string
  reviewNotes: string
  complianceSecurity: boolean
  compliancePrivacy: boolean
}

const BD_URL_RE = /^(?:https?:\/\/)?betterdiscord\.app\/(plugin|theme)\/([^/]+)/i;
const PLAIN_RE = /^[a-z0-9-]+$/i;

const verificationSchema = {
  body: {
    required: [ 'workUrl', 'workAbout', 'developerAbout', 'workFuture', 'why', 'complianceCute' ],
    additionalProperties: false,
    type: 'object',
    properties: {
      workUrl: { type: 'string',
        maxLength: 256 },
      workAbout: { type: 'string',
        minLength: 128,
        maxLength: 2048 },
      developerAbout: { type: 'string',
        minLength: 128,
        maxLength: 2048 },
      workFuture: { type: 'string',
        minLength: 128,
        maxLength: 2048 },
      why: { type: 'string',
        minLength: 128,
        maxLength: 2048 },
      complianceCute: { type: 'boolean' }
    }
  }
};

const hostingSchema = {
  body: {
    required: [ 'repoUrl', 'purpose', 'technical', 'subdomain', 'reviewNotes', 'complianceSecurity', 'compliancePrivacy' ],
    additionalProperties: false,
    type: 'object',
    properties: {
      repoUrl: { type: 'string',
        maxLength: 256 },
      purpose: { type: 'string',
        maxLength: 1024 },
      technical: { type: 'string',
        maxLength: 1024 },
      subdomain: { type: 'string',
        minLength: 3,
        maxLength: 16 },
      reviewNotes: { type: 'string',
        maxLength: 1024 },
      complianceSecurity: { type: 'boolean' },
      compliancePrivacy: { type: 'boolean' }
    }
  }
};

const fieldToDescription: Record<string, string> = {
  repoUrl: 'Repository URL',
  reviewNotes: 'Notes for review',
  bdAlternative: 'BD alternative',
  workUrl: 'Work URL',
  workAbout: 'About the work',
  developerAbout: 'About the dev',
  workFuture: 'The future',
  why: 'Why they want it',
  purpose: 'Purpose',
  technical: 'Technical details',
  subdomain: 'Desired subdomain',
  type: 'Type',
  description: 'Description'
};

// -- Helpers
async function fetchEligibility (db: Db, user?: User | null): Promise<EligibilityStatus> {
  if (user) {
    const banStatus = await db.collection<any>('userbans').findOne({ _id: user!._id });
    return {
      publish: banStatus?.publish ? 2 : 0,
      verification: banStatus?.verification ? 2 : 0,
      hosting: banStatus?.hosting ? 2 : 0,
      reporting: banStatus?.reporting ? 2 : 0
    };
  }

  return {
    publish: 0,
    verification: 0,
    hosting: 0,
    reporting: 1
  };
}

async function isAvailable (subdomain: string): Promise<boolean> {
  return new Promise((resolve) => lookup(`${subdomain}.replugged.dev`, (e) => resolve(e?.code === 'ENOTFOUND')));
}

/** @deprecated */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stringifyForm (data: Record<string, unknown>): string {
  const acc: string[] = [];
  for (const key in data) {
    if (key in data && key in fieldToDescription) {
      const value = (data[key] || 'N/A') as string;
      acc.push(`**${fieldToDescription[key]}**: ${value.length > 128 ? `${value.slice(128)}...` : value}`);
    }
  }

  return acc.join('\n');
}

type EmbedField = {
  inline?: boolean
  name: string
  value: string
}

function fieldifyForm (data: Record<string, unknown>): EmbedField[] {
  const fields: EmbedField[] = [];
  for (const key in data) {
    if (key in data && key in fieldToDescription) {
      const value = data[key] as string;
      if (value !== '') {
        fields.push({
          name: fieldToDescription[key],
          value: value.length > 128 ? `${value.slice(128)}...` : value
        });
      }
    }
  }

  return fields;
}

async function finalizeForm (db: Db, user: User, kind: string, data: Record<string, unknown>, reply: FastifyReply) {
  const collection = db.collection('forms');
  const pending = await collection.countDocuments({ submitter: user._id,
    kind });
  if (pending > 5) {
    return reply.code(429).send();
  }

  const inserted = await collection.insertOne({ submitter: user._id,
    kind,
    ...data });
  const msg = await dispatchHonk(config.honks.formsChannel, {
    content: '',
    embeds: [
      {
        author: {
          name: `${user.username}#${user.discriminator} submitted a form!`,
          url: `${config.domain}/backoffice/store/forms#${inserted.insertedId.toHexString()}`
        },
        footer: {
          text: `Form ID: ${inserted.insertedId.toHexString()}`
        },
        fields: fieldifyForm(data),
        color: 7506394
      }
    ]
  });

  await collection.updateOne({ _id: inserted.insertedId }, { $set: { messageId: msg.id } });
  return reply.code(201).send();
}

// -- Routes handlers
async function publishForm (this: FastifyInstance, request: FastifyRequest<{ Body: PublishBody }>, reply: FastifyReply) {
  const eligibility = await fetchEligibility(this.mongo.db!, request.user!);
  if (eligibility.publish !== 0) {
    return reply.code(403).send();
  }

  if (request.body.bdAlternative) {
    const match = request.body.bdAlternative.match(BD_URL_RE);
    if (!match) {
      return reply.code(400)
        .send({ errors: { bdAlternative: 'The provided URL is invalid.' } });
    }

    const workKind = match[1];
    const workId = match[2];
    const res = await fetch(`https://betterdiscord.app/${workKind}/${workId}`).then((r) => r.text());
    if (res.includes('404 Not Found')) {
      return reply.code(400)
        .send({ errors: { bdAlternative: 'The provided URL doesn\'t point to a BetterDiscord work.' } });
    }
  }

  if (!request.body.type || ![ 'plugin', 'theme' ].includes(request.body.type)) {
    return reply.code(400)
      .send({ errors: { type: 'You must provde a type' } });
  }

  if (!request.body.complianceGuidelines) {
    return reply.code(400)
      .send({ errors: { complianceGuidelines: 'Your work must comply with the guidelines to be published.' } });
  }

  if (!request.body.complianceLegal) {
    return reply.code(400)
      .send({ errors: { complianceLegal: 'You must grant Replugged sufficient rights in order to publish your work on the store.' } });
  }

  return finalizeForm(this.mongo.db!, request.user!, 'publish', request.body, reply);
}

async function verificationForm (this: FastifyInstance, request: FastifyRequest<{ Body: VerificationBody }>, reply: FastifyReply) {
  const eligibility = await fetchEligibility(this.mongo.db!, request.user!);
  if (eligibility.verification !== 0) {
    return reply.code(403).send();
  }

  // todo: validate existence of store item

  if (!request.body.complianceCute) {
    return reply.code(400)
      .send({ errors: { complianceCute: 'Hey cutie, you forgot to confirm you\'re cute!!' } });
  }

  return finalizeForm(this.mongo.db!, request.user!, 'verification', request.body, reply);
}

async function hostingForm (this: FastifyInstance, request: FastifyRequest<{ Body: HostingBody }>, reply: FastifyReply) {
  const eligibility = await fetchEligibility(this.mongo.db!, request.user!);
  if (eligibility.hosting !== 0) {
    return reply.code(403).send();
  }

  if (!PLAIN_RE.test(request.body.subdomain)) {
    return reply.code(400)
      .send({ errors: { subdomain: 'The subdomain must only use letters, numbers and dashes.' } });
  }

  const availability = await isAvailable(request.body.subdomain);
  if (!availability) {
    return reply.code(400)
      .send({ errors: { subdomain: 'This subdomain is already taken.' } });
  }

  if (!request.body.complianceSecurity) {
    return reply.code(400)
      .send({ errors: { complianceSecurity: 'You must ensure minimum levels of safety in your backend.' } });
  }

  if (!request.body.compliancePrivacy) {
    return reply.code(400)
      .send({ errors: { compliancePrivacy: 'You must comply with the applicable privacy laws.' } });
  }

  return finalizeForm(this.mongo.db!, request.user!, 'hosting', request.body, reply);
}

export default async function (fastify: FastifyInstance): Promise<void> {
  // if (process.env.NODE_ENV !== 'development') return

  fastify.get('/eligibility', { config: { auth: { optional: true } } }, (request) => fetchEligibility(fastify.mongo.db!, request.user));
  fastify.post<{ Body: PublishBody }>('/publish', { config: { auth: {} } }, publishForm);
  fastify.post<{ Body: VerificationBody }>('/verification', { config: { auth: {} },
    schema: verificationSchema }, verificationForm);
  fastify.post<{ Body: HostingBody }>('/hosting', { config: { auth: {} },
    schema: hostingSchema }, hostingForm);
}
