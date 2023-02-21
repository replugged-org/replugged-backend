export const Endpoints = {
  LOGIN: '/api/v1/login',
  LOGOUT: '/api/v1/logout',
  USER_SELF: '/api/v1/users/@me',
  FETCH_USER: (id: string) => `/api/v1/users/${id}`,
  USER_REFRESH_PLEDGE: '/api/v1/users/@me/refresh-pledge',
  LINK_ACCOUNT: (platform: string) => `/api/v1/oauth/${platform}`,
  UNLINK_ACCOUNT: (platform: string) => `/api/v1/oauth/${platform}/unlink`,
  YEET_ACCOUNT: '/api/v1/oauth/discord/unlink',
  USER_AVATAR: (id: string) => `/api/v1/avatars/${id}.png`,
  USER_AVATAR_DISCORD: (id: string, avatar: string) => `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`,
  DEFAULT_AVATAR_DISCORD: (dicrim: number) => `https://cdn.discordapp.com/embed/avatars/${dicrim % 6}.png?size=128`,

  STORE_FORM_ELIGIBILITY: '/api/v1/store/forms/eligibility',
  STORE_FORM: (id: string) => `/api/v1/store/forms/${id}`,

  DOCS_CATEGORIES: '/api/v1/docs/categories',
  DOCS_DOCUMENT: (doc: string) => `/api/v1/docs/${doc}`,
  DOCS_CATEGORIZED: (cat: string, doc: string) => `/api/v1/docs/${cat}/${doc}`,

  STORE_ITEMS: (type: string) => `/api/v1/store/items/${type}`,
  STORE_ITEM: (type: string, id: string) => `/api/v1/store/items/${type}/${id}`,

  CONTRIBUTORS: '/api/v1/stats/contributors',
  STATS: '/api/v1/stats/numbers',

  BACKOFFICE_USERS: '/api/v1/backoffice/users',
  BACKOFFICE_USER: (id: string) => `/api/v1/backoffice/users/${id}`,
  BACKOFFICE_BANS: '/api/v1/backoffice/bans/',
  BACKOFFICE_BAN: (id: string) => `/api/v1/backoffice/bans/${id}`,
  BACKOFFICE_FORMS: '/api/v1/backoffice/forms?kind=hosting&kind=publish&kind=verification',
  BACKOFFICE_FORMS_COUNT: '/api/v1/backoffice/forms/count',
  BACKOFFICE_FORM: (id: string) => `/api/v1/backoffice/forms/${id}`,
  BACKOFFICE_REPORTS: '/api/v1/backoffice/forms?kind=reports',
  BACKOFFICE_TAGS: '/api/v1/backoffice/tags',
  BACKOFFICE_TAG: (id: string) => `/api/v1/backoffice/tags/${id}`,
  BACKOFFICE_GET_USERS_GUILD_PERKS: (user: string) => `/api/v1/backoffice/users/perks/guild/${user}`,
  BACKOFFICE_USER_COUNT: '/api/v1/backoffice/users/count'
};

export const Routes = {
  HOME: '/',
  ME: '/me',
  CONTRIBUTORS: '/contributors',
  STATS: '/stats',
  BRANDING: '/branding',
  INSTALL: '/install',
  FAQ: '/faq',
  DOWNLOAD: '/download',

  STORE: '/store',
  STORE_PLUGINS: '/store/plugins',
  STORE_THEMES: '/store/themes',
  STORE_SUGGESTIONS: 'https://github.com/replugged-org/suggestions/issues?q=is%3Aissue+is%3Aopen+label%3A%22up+for+grabs%22',
  STORE_MANAGE: '/store/manage',
  STORE_FORMS: '/store/forms',
  STORE_PUBLISH: '/store/forms/publish',
  STORE_VERIFICATION: '/store/forms/verification',
  STORE_HOSTING: '/store/forms/hosting',
  STORE_COPYRIGHT: '/store/copyright',

  DOCS: '/docs',
  DOCS_ITEM: (cat: string, doc: string) => `/docs/${cat}/${doc}`,
  DOCS_GITHUB: 'https://github.com/replugged-org/documentation',
  GUIDELINES: '/guidelines',
  PORKORD_LICENSE: '/porkord-license',
  TERMS: '/legal/tos',
  PRIVACY: '/legal/privacy',

  // Backoffice links
  // todo: lazyload unused ones?
  BACKOFFICE: '/backoffice',
  BACKOFFICE_USERS: '/backoffice/users',
  BACKOFFICE_USERS_MANAGE: (user: string) => `/backoffice/users/${user}`,
  BACKOFFICE_BANS: '/backoffice/bans',
  BACKOFFICE_BANS_MANAGE: (user: string) => `/backoffice/bans/${user}`,
  BACKOFFICE_MONITORING: '/backoffice/monitoring',
  BACKOFFICE_STORE_ITEMS: '/backoffice/store/items',
  BACKOFFICE_STORE_TAGS: '/backoffice/store/tags',
  BACKOFFICE_STORE_FRONT: '/backoffice/store/front',
  BACKOFFICE_STORE_FORMS: '/backoffice/store/forms',
  BACKOFFICE_THREATS: '/backoffice/threats',
  BACKOFFICE_STORE_FORMS_FORM: (id: string) => `/backoffice/store/forms/${id}`,
  BACKOFFICE_STORE_REPORTS: '/backoffice/store/reports',
  BACKOFFICE_STORE_REPORTS_REPORT: (id: string) => `/backoffice/store/reports/${id}`,
  BACKOFFICE_EVENTS_SECRET: '/backoffice/events/secret',
  BACKOFFICE_BOT_TAGS: '/backoffice/bot/tags',

  // External links
  DICKSWORD: 'https://discord.gg/replugged',
  GITHUB: 'https://github.com/replugged-org/replugged',
  TRANSLATIONS: 'https://i18n.replugged.dev/projects/replugged/replugged',
  PATREON: 'https://google.com'
};
