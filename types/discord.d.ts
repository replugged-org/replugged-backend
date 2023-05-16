/* eslint-disable @typescript-eslint/naming-convention */
export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface Member {
  user: User;
  nick?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}

// Note: type is incomplete
export interface ApiMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: User;
  member?: Member;
  content: string;
  timestamp: string;
  thread?: { id: string };
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  color: number;
  title: string;
  url: string;
  author: {
    name: string;
    icon_url: string;
    url: string;
  };
  description: string;
  thumbnail: {
    url: string;
  };
  fields: DiscordEmbedField[];
  image: {
    url: string;
  };
  tmestamp: Date;
  footer: {
    text: string;
    icon_url: string;
  };
}
