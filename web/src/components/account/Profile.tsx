/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type User } from "../UserContext";
import {
  Fragment,
  VNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
} from "preact";
import { UserFlags } from "../../../../shared/flags";

import Tooltip from "../util/Tooltip";
import Avatar from "../util/Avatar";

import HibiscusMono from "../../assets/badges/hibiscus-mono.svg";
import Developer from "../../assets/badges/developer.svg";
import Support from "../../assets/badges/support.svg";
import Staff from "../../assets/badges/staff.svg";
import Contributor from "../../assets/badges/contributor.svg";
import Translator from "../../assets/badges/translator.svg";
import Hunter from "../../assets/badges/hunter.svg";
import Early from "../../assets/badges/early.svg";

import style from "./profile.module.css";
import sharedStyle from "../shared.module.css";

interface ProfileProps {
  user: User;
  onEdit: () => void;
}

type ProfileBadgesProps = Pick<User, "flags" | "cutiePerks">;

function ProfileBadges({ flags, cutiePerks }: ProfileBadgesProps): VNode {
  console.log(flags);
  return (
    <div className={style.badges} style={{ color: `#${cutiePerks.color || "7289da"}` }}>
      <Tooltip text={cutiePerks.title ?? "Replugged Supporter"} align="center">
        {cutiePerks.badge && cutiePerks.badge !== "default" ? (
          <img src={cutiePerks.badge} className={style.badge} />
        ) : (
          // @ts-expect-error
          <HibiscusMono className={style.badge} />
        )}
      </Tooltip>
      {Boolean(flags & UserFlags.DEVELOPER) && (
        <Tooltip text="Replugged Developer" align="center">
          {/* @ts-expect-error */}
          <Developer className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.STAFF) && (
        <Tooltip text="Replugged Staff" align="center">
          {/* @ts-expect-error */}
          <Staff className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.SUPPORT) && (
        <Tooltip text="Replugged Support" align="center">
          {/* @ts-expect-error */}
          <Support className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.CONTRIBUTOR) && (
        <Tooltip text="Replugged Contributor" align="center">
          {/* @ts-expect-error */}
          <Contributor className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.TRANSLATOR) && (
        <Tooltip text="Replugged Translator" align="center">
          {/* @ts-expect-error */}
          <Translator className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.BUG_HUNTER) && (
        <Tooltip text="Replugged Bug Hunter" align="center">
          {/* @ts-expect-error */}
          <Hunter className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.EARLY_USER) && (
        <Tooltip text="Replugged Early User" align="center">
          {/* @ts-expect-error */}
          <Early className={style.badge} />
        </Tooltip>
      )}
    </div>
  );
}

export default function Profile({ user, onEdit }: ProfileProps): VNode {
  return (
    <Fragment>
      <div className={style.container}>
        <div className={style.banner} />
        <div className={style.section}>
          <div className={style.decorations}>
            <Avatar user={user} class={style.avatar} />
            <ProfileBadges flags={user.flags} cutiePerks={user.cutiePerks} />
          </div>
          <div className={style.props}>
            <span>{user.username}</span>
            <span className={style.discriminator}>#{user.discriminator}</span>
          </div>
        </div>
        <div className={style.section}>
          <h3 className={style.header}>Roles</h3>
          <div className={style.roles}>
            <div className={style.role}>
              <div className={`${style.roleRound} ${style.roleBlurple}`} />
              <span>Replugged Supporter</span>
            </div>
            <div className={style.role}>
              <div className={`${style.roleRound} ${style.rolePink}`} />
              <span>Tier {user.cutieStatus.pledgeTier} Supporter</span>
            </div>
          </div>
        </div>
      </div>
      <button className={sharedStyle.button} onClick={onEdit}>
        Edit perks
      </button>
    </Fragment>
  );
}
