import type { MinimalUser } from "../../../../types/users";
import { useState, useCallback } from "preact/hooks";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from "preact";

import { Endpoints } from "../../constants";

import style from "./avatar.module.css";

type AvatarProps = {
  user: MinimalUser;
  class?: string;
};

export function DiscordAvatar({ user, class: className }: AvatarProps) {
  const avatar = user.avatar
    ? Endpoints.USER_AVATAR_DISCORD(user._id, user.avatar)
    : Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator));

  const [effectiveAvatar, setAvatar] = useState(avatar);
  const onError = useCallback(
    () => setAvatar(Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))),
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

export default function Avatar({ user, class: className }: AvatarProps) {
  return (
    <img
      src={Endpoints.USER_AVATAR(user._id)}
      alt={`${user.username}'s avatar`}
      className={className ? `${style.avatar} ${className}` : style.avatar}
    />
  );
}
