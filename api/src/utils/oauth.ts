import { URLSearchParams } from "url";
import { fetch } from "undici";
import config from "../config.js";

export type OAuthToken = {
  tokenType: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

export const OAuthEndpoints = <const>{
  discord: {
    AUTHORIZE_URL: "https://discord.com/oauth2/authorize",
    TOKEN_URL: "https://discord.com/api/oauth2/token",
    SELF_URL: "https://discord.com/api/v9/users/@me",
  },
  spotify: {
    AUTHORIZE_URL: "https://accounts.spotify.com/authorize",
    TOKEN_URL: "https://accounts.spotify.com/api/token",
    SELF_URL: "https://api.spotify.com/v1/me",
  },
  github: {
    AUTHORIZE_URL: "https://github.com/login/oauth/authorize",
    TOKEN_URL: "https://github.com/login/oauth/access_token",
    SELF_URL: "https://api.github.com/user",
  },
  patreon: {
    AUTHORIZE_URL: "https://patreon.com/oauth2/authorize",
    TOKEN_URL: "https://patreon.com/api/oauth2/token",
    SELF_URL:
      "https://patreon.com/api/oauth2/v2/identity?include=memberships,memberships.currently_entitled_tiers,memberships.user&fields%5Bmember%5D=patron_status,full_name,last_charge_date,next_charge_date&fields%5Buser%5D=social_connections,email",
  },
};

export type OAuthProvider = keyof typeof OAuthEndpoints;

async function fetchToken(provider: OAuthProvider, params: URLSearchParams): Promise<OAuthToken> {
  const response = await fetch(OAuthEndpoints[provider].TOKEN_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (response.status !== 200) {
    response.blob();
    throw new Error(`Token exchange failed: ${response.status}: ${response.statusText}`);
  }

  const rawToken = <any>await response.json();

  const token: OAuthToken = {
    tokenType: rawToken.token_type,
    accessToken: rawToken.access_token,
    expiresAt: Date.now() + rawToken.expires_in * 1e3,
  };

  if (rawToken.refresh_token) {
    token.refreshToken = rawToken.refresh_token;
  }

  return token;
}

export function getAuthorizationUrl(
  provider: OAuthProvider,
  redirect: string,
  scopes: string[],
  state: string,
): string {
  const params = new URLSearchParams();
  params.set("state", state);
  params.set("response_type", "code");
  params.set("redirect_uri", `${config.domain}${redirect}`);
  params.set("client_id", config[provider].clientID);
  params.set("scope", scopes.join(" "));

  return `${OAuthEndpoints[provider].AUTHORIZE_URL}?${params.toString()}`;
}

export async function getAuthTokens(
  provider: OAuthProvider,
  redirect: string,
  code: string,
): Promise<OAuthToken> {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", config[provider].clientID);
  body.set("client_secret", config[provider].clientSecret);
  body.set("redirect_uri", `${config.domain}${redirect}`);
  body.set("code", code);

  return fetchToken(provider, body);
}

export async function refreshAuthTokens(
  provider: OAuthProvider,
  refresh: string,
): Promise<OAuthToken> {
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("client_id", config[provider].clientID);
  body.set("client_secret", config[provider].clientSecret);
  body.set("refresh_token", refresh);

  return fetchToken(provider, body);
}

export async function fetchAccount<TAccount = unknown>(
  provider: OAuthProvider,
  token: OAuthToken,
): Promise<TAccount> {
  const authorization = `${token.tokenType ?? "Bearer"} ${token.accessToken}`;
  return <Promise<TAccount>>fetch(OAuthEndpoints[provider].SELF_URL, {
    headers: {
      accept: "application/json",
      authorization,
    },
  }).then((r: any) => r.json());
}

export function toMongoFields(token: OAuthToken, platform: string) {
  const res = {
    [`accounts.${platform}.tokenType`]: token.tokenType,
    [`accounts.${platform}.accessToken`]: token.accessToken,
    [`accounts.${platform}.expiresAt`]: token.expiresAt,
  };

  if (token.refreshToken) {
    res[`accounts.${platform}.refreshToken`] = token.refreshToken;
  }

  return res;
}
