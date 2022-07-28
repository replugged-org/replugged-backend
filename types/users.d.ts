export type ExternalAccount = {
    tokenType: string
    accessToken: string
    refreshToken: string
    // todo: ditch unix
    expiresAt: number
    name: string
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
    }
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
  }
  
  export type RestUserPrivate = RestUser & {
    username: User['username']
    discriminator: User['discriminator']
    avatar: User['avatar']
    accounts: {
      spotify?: string
      patreon?: string
    }
    createdAt: User['createdAt']
  }
  