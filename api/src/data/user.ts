import type { MongoClient } from 'mongodb'
import type { DatabaseUser, User, GhostUser, RestUser, RestUserPrivate } from '../../../types/users'
import { URL } from 'url'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import config from '../../../shared/config.js'
import { SETTINGS_STORAGE_FOLDER } from '../api/settings.js'
import { fetchMember, setRoles } from '../utils/discord.js'
import { UserFlags, PrivateUserFlags, PersistentUserFlags } from '../../../shared/flags'

export enum UserDeletionCause {
  // User initiated account deletion manually
  REQUESTED,

  // Account deletion scheduled due to inactivity
  AUTOMATIC,

  // Account deleted (or banned) by an administrator
  ADMINISTRATOR,
}

const ROLES_TO_REVOKE = [
  config.discord.roles.user,
  config.discord.roles.hunter,
  config.discord.roles.translator,
  config.discord.roles.contributor,
  config.discord.roles.donator,
]

export function isGhostUser (user: DatabaseUser): user is GhostUser {
  return (user.flags & UserFlags.GHOST) !== 0
}

export function formatUser (user: User, includePrivate?: boolean): RestUser
export function formatUser (user: User, includePrivate?: true, allFlags?: boolean): RestUserPrivate
export function formatUser (user: User, includePrivate?: boolean, allFlags?: boolean): RestUser | RestUserPrivate {

  const restUser = {
    _id: user._id,
    flags: user.flags & ~PrivateUserFlags,
  }

  if (includePrivate) {
    return {
      ...restUser,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      flags: allFlags ? user.flags : restUser.flags,
      accounts: {
        spotify: user.accounts.spotify?.name || void 0,
      },
    }
  }

  return restUser
}

export async function deleteUser (mongo: MongoClient, userId: string, _reason: UserDeletionCause) {
  const database = mongo.db()
  const userCollection = database.collection<DatabaseUser>('users')

  const user = await userCollection.findOne({ _id: userId })
  if (!user || user.flags & UserFlags.GHOST) return

  // Wipe on-disk data
  const syncFile = new URL(userId, SETTINGS_STORAGE_FOLDER)
  if (existsSync(syncFile)) await unlink(syncFile)

  // Delete user entry, or keep flags if necessary
  if (user.flags & PersistentUserFlags) {
    // We keep the flags we want to keep track of
    await userCollection.replaceOne({ _id: userId }, { flags: (user.flags & PersistentUserFlags) | UserFlags.GHOST })
  } else {
    // We simply delete the entry as we don't need it anymore
    await userCollection.deleteOne({ _id: userId })
  }

  // todo: handle store items

  // Update member on the guild
  const member = await fetchMember(userId)
  if (member) {
    const newRoles = member.roles.filter((r: any) => !ROLES_TO_REVOKE.includes(r))
    await setRoles(userId, newRoles, 'User deleted their replugged.dev account')
  }
}