import { useState, useContext } from 'preact/hooks';
import { UserFlags } from '../../../../shared/flags';
import UserContext from '../UserContext';
import Avatar from '../util/Avatar';
import Hamburger from '../util/Hamburger';
import { Endpoints, Routes } from '../../constants';
import Staff from '../../assets/badges/staff.svg';
import style from './header.module.css';
import sharedStyle from '../shared.module.css';
function User() {
    const user = useContext(UserContext);
    const isStaff = ((user?.flags ?? 0) & UserFlags.STAFF) !== 0;
    if (!user) {
        return (
        /* @ts-expect-error */
        <a native href={Endpoints.LOGIN} className={sharedStyle.button}>Login with Discord</a>);
    }
    return (<div className={style.profile}>
            <Avatar user={user}/>
            <div className={style.details}>
                <div className={style.name}>
                    <div className={style.username}>{user.username}<span className={style.discriminator}>#{user.discriminator}</span></div>
                    {/* @ts-ignore */}
                    {isStaff && <Staff className={style.badge}/>}
                </div>
                <div>
                    <a className={style.link} href={Routes.ME}>Account</a>
                    {/* @ts-expect-error */}
                    <a className={style.link} href={Endpoints.LOGOUT} native>Logout</a>
                </div>
                {isStaff && <a className={style.link} href={Routes.BACKOFFICE}>Administration</a>}
            </div>
        </div>);
}
export default function Header() {
    const [opened, setOpened] = useState(false);
    return (<header className={`${style.container}${opened ? ` ${style.opened}` : ''}`}>
            <a className={style.logo} href={Routes.HOME}>
                {/* {isOctober
  ? <img className={style.plug} src={spookycordPlug} alt='Replugged Logo'/>
  : <RepluggedPlug className={style.plug}/>}
<RepluggedWordmark className={style.wordmark}/> */}
                Replugged Logo Here
            </a>

            <nav className={style.nav}>
                <a className={style.navLink} href={Routes.INSTALLATION}>Installation</a>
                <a className={style.navLink} href={Routes.STORE}>Store</a>
                <a className={style.navLink} href={Routes.CONTRIBUTORS}>Contributors</a>
                <a className={style.navLink} href={Routes.DICKSWORD} target='_blank' rel='noreferrer'>Discord Server</a>
                <a className={style.navLink} href={Routes.FAQ}>FAQ</a>
            </nav>

            <div className={style.account}>
                <User />
            </div>

            <Hamburger opened={opened} setOpened={setOpened} className={style.b}/>
        </header>);
}
