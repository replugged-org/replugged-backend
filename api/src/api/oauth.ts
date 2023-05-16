/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ConfiguredReply, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { OAuthProvider, OAuthToken } from "../utils/oauth.js";
import type { DatabaseUser, User } from "../../../types/users";
import { Long, type UpdateFilter } from "mongodb";
import { randomBytes } from "crypto";
import config from "../config.js";
import { UserFlags } from "../flags.js";
import { fetchAccount, getAuthTokens, getAuthorizationUrl, toMongoFields } from "../utils/oauth.js";
import { deleteUser } from "../data/user.js";
import { addRole, fetchMember, removeRole } from "../utils/discord.js";
import { TokenType } from "../utils/auth.js";
import { notifyStateChange, prepareUpdateData } from "../utils/patreon.js";

interface OAuthConfig {
  platform: OAuthProvider;
  scopes: string[];
  isRestricted?: boolean;
}

interface OAuthOptions {
  data: OAuthConfig;
}

interface AuthorizationRequestProps {
  Querystring: {
    redirect?: string;
    // api:v2
    code?: string;
    error?: string;
  };
}

interface CallbackRequestProps {
  Querystring: {
    code?: string;
    error?: string;
    state?: string;
  };
}

type Reply = ConfiguredReply<FastifyReply, OAuthConfig>;

// eslint-disable-next-line require-await
async function authorize(
  this: FastifyInstance,
  request: FastifyRequest<AuthorizationRequestProps>,
  reply: Reply,
): Promise<void> {
  if (reply.context.config.platform === "discord" && request.user) {
    reply.redirect("/me");
    return;
  }

  if (reply.context.config.isRestricted && ((request.user?.flags ?? 0) & UserFlags.STAFF) === 0) {
    reply.redirect("/");
    return;
  }

  const apiVersion = this.prefix.split("/")[1];
  const cookieSettings = {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    path: `/api/${apiVersion}`,
    secure: process.env.NODE_ENV === "production",
    maxAge: 300,
  } as const;

  if (reply.context.config.platform !== "discord" && !request.user) {
    reply.setCookie("redirect", `/api${request.url}`, cookieSettings);
    reply.redirect(`/api/${apiVersion}/login`);
    return;
  }

  const state = randomBytes(16).toString("hex");
  reply.setCookie("state", state, cookieSettings);

  const redirect = `${request.routerPath}/callback`;
  reply.redirect(
    getAuthorizationUrl(
      reply.context.config.platform,
      redirect,
      reply.context.config.scopes,
      state,
    ),
  );
}

async function callback(
  this: FastifyInstance,
  request: FastifyRequest<CallbackRequestProps>,
  reply: Reply,
): Promise<void> {
  const collection = this.mongo.db!.collection<DatabaseUser>("users");
  const returnPath = reply.context.config.platform === "discord" ? "/" : "/me";
  const authStatus = Boolean(reply.context.config.platform === "discord") !== Boolean(request.user);

  if (!authStatus || !request.query.state) {
    reply.redirect(returnPath);
    return;
  }

  // const stateCookie = request.cookies.state ? reply.unsignCookie(request.cookies.state) : null
  const redirectCookie = request.cookies.redirect
    ? reply.unsignCookie(request.cookies.redirect)
    : null;

  const apiVersion = this.prefix.split("/")[1];
  reply.setCookie("state", "", {
    sameSite: "lax",
    path: `/api/${apiVersion}`,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  reply.setCookie("redirect", "", {
    sameSite: "lax",
    path: `/api/${apiVersion}`,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  // if (!stateCookie?.valid || request.query.state !== stateCookie.value) {
  //   reply.redirect(returnPath)
  //   return
  // }

  if (request.query.error || !request.query.code) {
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_failure`);
    return;
  }

  let oauthToken: OAuthToken;
  let account: any;
  try {
    oauthToken = await getAuthTokens(
      reply.context.config.platform,
      request.routerPath,
      request.query.code,
    );
    account = await fetchAccount<any>(reply.context.config.platform, oauthToken);
  } catch (e) {
    console.error("oauth.ts l109", e);
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_failure`);
    return;
  }

  if (reply.context.config.platform === "discord") {
    const isBanned = await collection.countDocuments({
      _id: account.id,
      flags: { $bitsAllSet: UserFlags.BANNED },
    });
    if (isBanned) {
      reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_banned`);
      return;
    }

    const date = new Date();
    const res = await collection.findOneAndUpdate(
      { _id: account.id },
      {
        $currentDate: { updatedAt: true },
        $min: { createdAt: date }, // Add creation time if necessary
        $bit: { flags: { and: new Long(((1n << 64n) - 1n) & ~BigInt(UserFlags.GHOST), true) } }, // Remove ghost flag
        $set: {
          username: account.username,
          discriminator: account.discriminator,
          avatar: account.avatar,
          ...toMongoFields(oauthToken, "discord"),
        },
      },
      { upsert: true, returnDocument: "after", projection: { flags: 1, createdAt: 1 } },
    );

    // Cast is safe
    const user = res.value as User;

    const member = await fetchMember(user._id);
    if (member) {
      if (!member?.roles.includes(config.discord.roles.user)) {
        addRole(
          user._id,
          config.discord.roles.user,
          "User created their replugged.dev account",
        ).catch(() => 0);
      }
    }

    if (user.createdAt === date) {
      // New account
      addRole(
        user._id,
        config.discord.roles.user,
        "User created their replugged.dev account",
      ).catch(() => 0);
    }

    const token = reply.generateToken({ id: user._id }, TokenType.WEB);
    reply.setCookie("token", token, {
      // Signing the cookie is unnecessary as the JWT itself is signed
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 3600,
    });

    reply.redirect(redirectCookie?.value ?? "/me");
    return;
  }

  const accountId = account.data?.id || account.id;
  const accountName = account.data?.attributes.email || account.login || account.display_name;
  const accountOwner = await collection.findOne({
    [`accounts.${reply.context.config.platform}.id`]: accountId,
  });
  if (accountOwner && accountOwner._id !== request.user!._id) {
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=already_linked`);
    return;
  }

  let update: UpdateFilter<User> = {
    $currentDate: { updatedAt: true },
    $set: {
      [`accounts.${reply.context.config.platform}.id`]: accountId,
      [`accounts.${reply.context.config.platform}.name`]: accountName,
      ...toMongoFields(oauthToken, reply.context.config.platform),
    },
  };

  if (
    reply.context.config.platform === "patreon" &&
    !("patreon" in request.user!.accounts) &&
    (request.user!.flags & UserFlags.CUTIE_OVERRIDE) === 0
  ) {
    const data = await prepareUpdateData(oauthToken);
    update = {
      ...data,
      $set: {
        ...(data.$set ?? {}),
        ...update.$set,
      },
    };
  }

  const res = await collection.findOneAndUpdate({ _id: request.user!._id }, update, {
    returnDocument: "after",
  });

  // Patreon update report
  const updatedUser = res.value as User;
  const prevFlag = Boolean(request.user!.flags & UserFlags.IS_CUTIE);
  const updatedFlag = Boolean(updatedUser!.flags & UserFlags.IS_CUTIE);
  const prevTier = request.user!.cutieStatus?.pledgeTier ?? 0;
  const updatedTier = updatedUser.cutieStatus?.pledgeTier ?? 0;
  if (prevFlag !== updatedFlag || prevTier !== updatedTier) {
    notifyStateChange(updatedUser, "pledge");
  }

  reply.redirect(redirectCookie?.value ?? "/me");
}

async function unlink(this: FastifyInstance, request: FastifyRequest, reply: Reply): Promise<void> {
  if (reply.context.config.platform === "discord") {
    if (request.user!.flags & UserFlags.STORE_PUBLISHER) {
      reply.redirect("/me?error=delete_blocked");
      return;
    }

    await deleteUser(this.mongo.client, request.user!._id);

    const member = await fetchMember(request.user!._id);

    if (member) {
      if (member.roles.includes(config.discord.roles.user)) {
        removeRole(request.user!._id, config.discord.roles.user);
      }
    }

    reply.setCookie("token", "", { maxAge: 0, path: "/" });
    reply.redirect("/");
    return;
  }

  if (reply.context.config.isRestricted && ((request.user?.flags ?? 0) & UserFlags.STAFF) === 0) {
    reply.redirect("/");
    return;
  }

  await this.mongo.db!.collection<DatabaseUser>("users").updateOne(
    { _id: request.user!._id },
    {
      $currentDate: { updatedAt: true },
      $unset: { [`accounts.${reply.context.config.platform}`]: 1 },
    },
  );

  reply.redirect("/me");
}

function oauthPlugin(fastify: FastifyInstance, options: OAuthOptions): void {
  fastify.route({
    method: "GET",
    url: "/",
    handler: authorize,
    config: {
      ...options.data,
      auth: { optional: true },
    },
  });

  fastify.route({
    method: "GET",
    url: "/callback",
    handler: callback,
    config: {
      ...options.data,
      auth: { optional: true },
    },
  });

  fastify.route({
    method: "GET",
    url: "/unlink",
    handler: unlink,
    config: {
      ...options.data,
      auth: {},
    },
  });
}

export default function (fastify: FastifyInstance): void {
  fastify.register(oauthPlugin, {
    prefix: "/discord",
    data: {
      platform: "discord",
      scopes: ["identify"],
    },
  });

  fastify.register(oauthPlugin, {
    prefix: "/spotify",
    data: {
      platform: "spotify",
      scopes: [
        // Know what you're playing
        "user-read-currently-playing",
        "user-read-playback-state",
        // Change tracks on your behalf
        "user-modify-playback-state",
        // Read your public & private songs
        "playlist-read-private",
        "user-library-read",
        "user-top-read",
        // Add things to your library
        "user-library-modify",
        "playlist-modify-public",
        "playlist-modify-private",
      ],
    },
  });

  fastify.register(oauthPlugin, {
    prefix: "/github",
    data: {
      isRestricted: true,
      platform: "github",
      scopes: [],
    },
  });

  fastify.register(oauthPlugin, {
    prefix: "/patreon",
    data: {
      platform: "patreon",
      scopes: ["identity", "identity[email]"],
    },
  });
}
