export type ExternalAccount = {
  tokenType: string
  accessToken: string
  refreshToken: string
  // todo: ditch unix
  expiresAt: number
  name: string
}

export type CutieStatus = {
  pledgeTier: number
  // todo: ditch unix
  perksExpireAt: number
  // todo: ditch unix
  lastManualRefresh?: number
}

export type CutiePerks = {
  color: string | null
  badge: string | null
  title: string | null
}


export type User = {
  _id: string
  username: string
  discriminator: string
  avatar: string | null
  flags: number
  accounts: {
    discord: Omit<ExternalAccount, 'name'>
    spotify?: ExternalAccount
    patreon?: ExternalAccount
  },
  cutieStatus?: CutieStatus
  cutiePerks?: CutiePerks
  createdAt: Date
  updatedAt?: Date
}

export type GhostUser = {
  _id: string
  flags: number
}

export type MinimalUser = {
  _id: string
  username: string
  discriminator: string
  avatar: string | null
}

export type DatabaseUser = User | GhostUser

/// REST-specific types
export type RestUser = {
  _id: User['_id']
  flags: User['flags']
  cutiePerks: Exclude<User['cutiePerks'], undefined>
}

export type RestUserPrivate = RestUser & {
  username: User['username']
  discriminator: User['discriminator']
  avatar: User['avatar']
  cutieStatus: CutieStatus
  accounts: {
    spotify?: string
    patreon?: string
  }
  createdAt: User['createdAt']
}

export type UserBanStatus = {
  account: boolean
  publish: boolean
  verification: boolean
  hosting: boolean
  reporting: boolean
  sync: boolean
  events: boolean
}

export type RestAdminUser = RestUser & MinimalUser & { banStatus?: UserBanStatus }