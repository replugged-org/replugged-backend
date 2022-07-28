import {
    type User
} from "../UserContext";
import {
    h,
    Fragment
} from 'preact';
import { UserFlags } from "../../../../shared/flags";

import Tooltip from "../util/Tooltip";
import Avatar from "../util/Avatar";

import Developer from '../../assets/badges/developer.svg'
import Support from '../../assets/badges/support.svg'
import Staff from '../../assets/badges/staff.svg'
import Contributor from '../../assets/badges/contributor.svg'
import Translator from '../../assets/badges/translator.svg'
import Hunter from '../../assets/badges/hunter.svg'
import Early from '../../assets/badges/early.svg'

import style from './profile.module.css'

type ProfileProps = {
    user: User
}

type ProfileBadgesProps = Pick<User, 'flags'>

function ProfileBadges({ flags }: ProfileBadgesProps) {
    return (
        <div className={style.badges} style={{ color: '#7289da' }}>
            {Boolean(flags & UserFlags.DEVELOPER) && (
                <Tooltip text='Powercord Developer' align='center'>
                    {/* @ts-ignore */}
                    <Developer className={style.badge} />
                </Tooltip>
            )}
            {Boolean(flags & UserFlags.STAFF) && (
                <Tooltip text='Powercord Staff' align='center'>
                    {/* @ts-ignore */}
                    <Staff className={style.badge} />
                </Tooltip>
            )}
            {Boolean(flags & UserFlags.SUPPORT) && (
                <Tooltip text='Powercord Support' align='center'>
                    {/* @ts-ignore */}
                    <Support className={style.badge} />
                </Tooltip>
            )}
            {Boolean(flags & UserFlags.CONTRIBUTOR) && (
                <Tooltip text='Powercord Contributor' align='center'>
                    {/* @ts-ignore */}
                    <Contributor className={style.badge} />
                </Tooltip>
            )}
            {Boolean(flags & UserFlags.TRANSLATOR) && (
                <Tooltip text='Powercord Translator' align='center'>
                    {/* @ts-ignore */}
                    <Translator className={style.badge} />
                </Tooltip>
            )}
            {Boolean(flags & UserFlags.BUG_HUNTER) && (
                <Tooltip text='Powercord Bug Hunter' align='center'>
                    {/* @ts-ignore */}
                    <Hunter className={style.badge} />
                </Tooltip>
            )}
            {Boolean(flags & UserFlags.EARLY_USER) && (
                <Tooltip text='Powercord Early User' align='center'>
                    {/* @ts-ignore */}
                    <Early className={style.badge} />
                </Tooltip>
            )}
        </div>
    )
}

export default function Profile({ user }: ProfileProps) {
    return (
        <Fragment>
            <div className={style.container}>
                <div className={style.banner}>
                    <div className={style.section}>
                        <div className={style.decorations}>
                            <Avatar user={user} class={style.avatar} />
                            <ProfileBadges flags={user.flags} />
                        </div>
                        <div className={style.props}>
                            <span>{user.username}</span>
                            <span className={style.discriminator}>#{user.discriminator}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}