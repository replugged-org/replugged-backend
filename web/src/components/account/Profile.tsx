import {
  type User
} from '../UserContext';
import {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Fragment
} from 'preact';
import { UserFlags } from '../../../../shared/flags';

import Tooltip from '../util/Tooltip';
import Avatar from '../util/Avatar';

import HibiscusMono from '../../assets/badges/hibiscus-mono.svg';
import Developer from '../../assets/badges/developer.svg';
import Support from '../../assets/badges/support.svg';
import Staff from '../../assets/badges/staff.svg';
import Contributor from '../../assets/badges/contributor.svg';
import Translator from '../../assets/badges/translator.svg';
import Hunter from '../../assets/badges/hunter.svg';
import Early from '../../assets/badges/early.svg';

import style from './profile.module.css';
import sharedStyle from '../shared.module.css';

type ProfileProps = {
  user: User
  onEdit: () => void
}

type ProfileBadgesProps = Pick<User, 'flags' | 'cutiePerks'>

function ProfileBadges ({ flags, cutiePerks }: ProfileBadgesProps) {
  console.log(flags);
  return (
    <div className={style.badges} style={{ color: `#${cutiePerks.color || '7289da'}` }}>

      <Tooltip text={cutiePerks.title ?? 'Replugged Cutie'} align='center'>
        {cutiePerks.badge && cutiePerks.badge !== 'default'
          ? <img src={cutiePerks.badge} className={style.badge} />
        // @ts-ignore
          : <HibiscusMono className={style.badge} />}
      </Tooltip>
      {Boolean(flags & UserFlags.DEVELOPER) && (
        <Tooltip text='Replugged Developer' align='center'>
          {/* @ts-ignore */}
          <Developer className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.STAFF) && (
        <Tooltip text='Replugged Staff' align='center'>
          {/* @ts-ignore */}
          <Staff className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.SUPPORT) && (
        <Tooltip text='Replugged Support' align='center'>
          {/* @ts-ignore */}
          <Support className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.CONTRIBUTOR) && (
        <Tooltip text='Replugged Contributor' align='center'>
          {/* @ts-ignore */}
          <Contributor className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.TRANSLATOR) && (
        <Tooltip text='Replugged Translator' align='center'>
          {/* @ts-ignore */}
          <Translator className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.BUG_HUNTER) && (
        <Tooltip text='Replugged Bug Hunter' align='center'>
          {/* @ts-ignore */}
          <Hunter className={style.badge} />
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.EARLY_USER) && (
        <Tooltip text='Replugged Early User' align='center'>
          {/* @ts-ignore */}
          <Early className={style.badge} />
        </Tooltip>
      )}
    </div>
  );
}

export default function Profile ({ user, onEdit }: ProfileProps) {
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
              <span>Replugged Cutie</span>
            </div>
            <div className={style.role}>
              <div className={`${style.roleRound} ${style.rolePink}`} />
              <span>Tier {user.cutieStatus.pledgeTier} Cutie</span>
            </div>
          </div>
        </div>
      </div>
      <button className={sharedStyle.button} onClick={onEdit}>Edit perks</button>
    </Fragment>
  );
}
