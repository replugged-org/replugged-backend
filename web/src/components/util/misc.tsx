import { VNode } from "preact";
import { MinimalUser } from "../../../../types/users";
import shared from "../shared.module.css";

export const toArray = <T,>(value: T): T extends unknown[] ? T : T extends undefined ? [] : T[] => {
  // @ts-expect-error bruh
  if (Array.isArray(value)) return value;
  // @ts-expect-error bruh
  if (value === undefined) return [];
  // @ts-expect-error bruh
  return [value];
};

export const getDisplayNameString = (user: MinimalUser): string => {
  return user.discriminator === "0"
    ? `@${user.username}`
    : `${user.username}#${user.discriminator}`;
};

export const getDisplayNameComponent = (user: MinimalUser): VNode =>
  user.discriminator === "0" ? (
    <>
      <span className={shared.at}>@</span>
      {user.username}
    </>
  ) : (
    <>
      {user.username}
      <span className={shared.discriminator}>#{user.discriminator}</span>
    </>
  );
