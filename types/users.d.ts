export interface ExternalAccount {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  // todo: ditch unix
  expiresAt: number;
  name: string;
}

export interface CutieStatus {
  pledgeTier: number;
  // todo: ditch unix
  perksExpireAt: number;
  // todo: ditch unix
  lastManualRefresh?: number;
}

export interface CutiePerks {
  color: string | null;
  badge: string | null;
  title: string | null;
  guild?: {
    id: string | null;
  };
}

export interface User {
  _id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  flags: number;
  accounts: {
    discord: Omit<ExternalAccount, "name">;
    spotify?: ExternalAccount;
    patreon?: ExternalAccount;
  };
  cutieStatus?: CutieStatus;
  cutiePerks?: CutiePerks;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GhostUser {
  _id: string;
  flags: number;
}

export interface MinimalUser {
  _id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export type DatabaseUser = User | GhostUser;

// / REST-specific types
export interface RestUser {
  _id: User["_id"];
  flags: User["flags"];
  cutiePerks: Exclude<User["cutiePerks"], undefined>;
  patronTier: number;
  badges: {
    developer: boolean;
    staff: boolean;
    support: boolean;
    contributor: boolean;
    hunter: boolean;
    early: boolean;
    translator: boolean;
  };
}

export type RestUserPrivate = RestUser & {
  username: User["username"];
  discriminator: User["discriminator"];
  avatar: User["avatar"];
  cutieStatus: CutieStatus;
  accounts: {
    spotify?: string;
    patreon?: string;
  };
  createdAt: User["createdAt"];
};

export interface UserBanStatus {
  account: boolean;
  publish: boolean;
  verification: boolean;
  hosting: boolean;
  reporting: boolean;
  sync: boolean;
  events: boolean;
}

export type RestAdminUser = RestUser & MinimalUser & { banStatus?: UserBanStatus };
