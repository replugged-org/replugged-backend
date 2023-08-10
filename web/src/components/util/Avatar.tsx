import type { MinimalUser } from "../../../../types/users";
import { useCallback, useState } from "preact/hooks";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VNode, h } from "preact";

import { Endpoints } from "../../constants";

import style from "./avatar.module.css";

interface AvatarProps {
  user: MinimalUser;
  class?: string;
}

const defaultAvatarKey = (user: MinimalUser): number => {
  // From the docs:
  // In the case of the Default User Avatar endpoint, the value for index depends on whether the user is migrated to the new username system.
  // For users on the new username system, index will be(user_id >> 22) % 6.
  // For users on the legacy username system, index will be discriminator % 5.

  if (user.discriminator !== "0") return Number(user.discriminator) % 5;

  // Need to use BigInt due to int overflow
  return Number(BigInt(user._id) >> 22n) % 6;
};

export function DiscordAvatar({ user, class: className }: AvatarProps): VNode {
  const avatar = user.avatar
    ? Endpoints.USER_AVATAR_DISCORD(user._id, user.avatar)
    : Endpoints.DEFAULT_AVATAR_DISCORD(defaultAvatarKey(user));

  const [effectiveAvatar, setAvatar] = useState(avatar);
  const onError = useCallback(
    () => setAvatar(Endpoints.DEFAULT_AVATAR_DISCORD(defaultAvatarKey(user))),
    [],
  );

  return (
    <img
      src={effectiveAvatar}
      alt={`${user.username}'s avatar`}
      className={className ? `${style.avatar} ${className}` : style.avatar}
      onError={onError}
    />
  );
}

export default function Avatar({ user, class: className }: AvatarProps): VNode {
  return (
    <img
      src={Endpoints.USER_AVATAR(user._id)}
      alt={`${user.username}'s avatar`}
      className={className ? `${style.avatar} ${className}` : style.avatar}
    />
  );
}
