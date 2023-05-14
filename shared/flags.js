// Visibility:
//  - Public: disclosed via API
//  - Private: internal/staff only

export const UserFlags = {
  // Developer status. Public
  DEVELOPER: 1 << 0,
  // Admin status. Public
  ADMIN: 1 << 1,
  // Staff status. Public
  STAFF: 1 << 2,
  // Moderator status. Public
  MODERATOR: 1 << 3,
  // Support status. Public
  SUPPORT: 1 << 4,
  // Contributor status. Public
  CONTRIBUTOR: 1 << 5,
  // Translator status. Public
  TRANSLATOR: 1 << 6,
  // Bug hunter status. Public
  BUG_HUNTER: 1 << 7,
  // Early user status. Public
  EARLY_USER: 1 << 8,

  // User currently has a published item in the store. Public.
  STORE_PUBLISHER: 1 << 12,
  // User has at least one verified item in the store. Public.
  VERIFIED_PUBLISHER: 1 << 13,

  // User is banned from logging in. Private.
  BANNED: 1 << 14,
  // User is banned from publishing in the store. Private.
  BANNED_PUBLISHER: 1 << 15,
  // User is banned from requesting verification. Private.
  BANNED_VERIFICATION: 1 << 16,
  // User is banned from requesting hosting. Private.
  BANNED_HOSTING: 1 << 17,
  // User is banned from submitting reports. Private.
  BANNED_REPORTING: 1 << 18,
  // User is banned from using Sync. Private.
  BANNED_SYNC: 1 << 19,
  // User is banned from participating in community events. Private.
  BANNED_EVENTS: 1 << 20,

  // User appealed a support ban. Private.
  APPEALED_SUPPORT: 1 << 21,
  // User appealed a server mute. Private.
  APPEALED_MUTE: 1 << 22,
  // User appealed a server ban. Private.
  APPEALED_BAN: 1 << 23,
  // User appealed a Sync ban. Private.
  APPEALED_SYNC: 1 << 24,
  // User appealed a community events ban. Private.
  APPEALED_EVENTS: 1 << 25,

  // User is a ghost entry (entry with no real user data, used for flag keeping purposes). Private.
  GHOST: 1 << 26,
};

export const PrivateUserFlags =
  0 |
  UserFlags.BANNED |
  UserFlags.BANNED_PUBLISHER |
  UserFlags.BANNED_VERIFICATION |
  UserFlags.BANNED_HOSTING |
  UserFlags.BANNED_REPORTING |
  UserFlags.BANNED_SYNC |
  UserFlags.BANNED_EVENTS |
  UserFlags.APPEALED_SUPPORT |
  UserFlags.APPEALED_MUTE |
  UserFlags.APPEALED_BAN |
  UserFlags.APPEALED_SYNC |
  UserFlags.APPEALED_EVENTS |
  UserFlags.GHOST;

// Flags that make a user go ghost instead of deleted.
export const PersistentUserFlags =
  0 |
  UserFlags.BANNED |
  UserFlags.BANNED_PUBLISHER |
  UserFlags.BANNED_VERIFICATION |
  UserFlags.BANNED_HOSTING |
  UserFlags.BANNED_REPORTING |
  UserFlags.BANNED_SYNC |
  UserFlags.BANNED_EVENTS |
  UserFlags.APPEALED_SUPPORT |
  UserFlags.APPEALED_MUTE |
  UserFlags.APPEALED_BAN |
  UserFlags.APPEALED_SYNC |
  UserFlags.APPEALED_EVENTS;
