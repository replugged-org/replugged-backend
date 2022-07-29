import {
    type JSX,
    h,
    Fragment
} from 'preact'
import {
    useContext,
    useState,
    useCallback,
} from 'preact/hooks'
import { useTitle } from 'hoofd/preact';
import { UserFlags } from '../../../../shared/flags.js';

import Profile from './Profile';
import Spinner from '../util/Spinner'
import Modal from '../util/Modal'

import UserContext from '../UserContext';
import { Endpoints, Routes } from '../../constants';

import Spotify from 'simple-icons/icons/spotify.svg'
import Link from 'feather-icons/dist/icons/link.svg'
import Remove from 'feather-icons/dist/icons/x-circle.svg'
import Refresh from 'feather-icons/dist/icons/rotate-cw.svg'
import AlertCircle from 'feather-icons/dist/icons/alert-circle.svg'

import style from './account.module.css'
import sharedStyle from '../shared.module.css'

type LinkedAccountProps = {
    platform: string
    icon: typeof Spotify
    explainer: string | JSX.Element
    account?: string
    refreshEndpoint?: string
}

function LinkedAccount({ platform, icon, account, explainer, refreshEndpoint }: LinkedAccountProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState<string | null>(null)
    const refresh = useCallback(async () => {
        if (!refreshEndpoint) return;

        setRefreshing(true)
        setRefreshError(null);
        const resp = await fetch(refreshEndpoint, { method: 'POST' })
        const body = await resp.json();
        setRefreshing(false);

        if (!resp.ok) {
            setRefreshError(body.message);
            return;
        }

    }, [refreshEndpoint])

    return (
        <div className={style.linkedAccount}>
            {h(icon, { className: style.linkedAccountIcon })}
            <div className={style.linkedAccountInfo}>
                <span>{account ?? 'No account linked'}</span>
                <div className={style.linkedAccountActions}>
                    {!account && (
                        // @ts-expect-error
                        <a native href={Endpoints.LINK_ACCOUNT(platform)} className={style.linkedAccountAction}>
                            <Link />
                            <span>Link accounts</span>
                        </a>
                    )}
                    {!refreshing && account && (
                        // @ts-expect-error
                        <a native href={Endpoints.UNLINK_ACCOUNT(platform)} className={style.linkedAccountAction}>
                            <Remove />
                            <span>Unlink</span>
                        </a>
                    )}
                    {!refreshing && account && refreshEndpoint && (
                        <button className={`${sharedStyle.buttonLink} ${style.linkedAccountAction}`} onClick={refresh}>
                            <Refresh />
                            <span>Refresh</span>
                        </button>
                    )}
                    {refreshing && <div className={style.linkedAccountAction}>
                        <Spinner balls />
                        <span>Refreshing...</span>
                    </div>}
                </div>
            </div>
            <div className={style.linkedAccountExplainer}>{explainer}</div>
            {refreshError && <div className={style.linkedAccountError}>
                <AlertCircle />
                <span>{refreshError}</span>
            </div>}
        </div>
    )
}

export default function Account() {
    useTitle('My Account');
    const user = useContext(UserContext)!;
    const [deletingAccount, setDeletingAccount] = useState(false);

    return (
        <main>
            <h1 className={style.title}>Welcome back, {user.username}</h1>
            <div className={style.columns}>
                <div className={style.linkedAccounts}>
                    <h2 className={style.title}>Linked Accounts</h2>
                    <LinkedAccount
                        platform='spotify'
                        icon={Spotify}
                        account={user.accounts.spotify}
                        explainer={'Linking your Spotify account gives you an enhanced experience with the Spotify plugin. It\'ll let you add songs to your Liked Songs, add songs to playlists, see private playlists and more.'}
                    />

                    <hr className={style.separator} />
                    <h2 className={style.title}>Delete my account</h2>
                    {(user.flags & UserFlags.STORE_PUBLISHER) === 0
                        ? <Fragment>
                            <p className={style.paragraph}>
                                You can choose to permanently delete your Replugged account. Be careful, this action is irreversible and
                                will take effect immediately.
                            </p>
                            <p className={style.paragraph}>
                                We will drop any data we have about you, and you'll no longer be able to benefit from features requiring
                                a Replugged account (such as enhanced Spotify plugin, settings sync, and more).
                            </p>
                            <p className={style.paragraph}>
                                <button className={`${sharedStyle.buttonLink} ${sharedStyle.red}`} onClick={() => setDeletingAccount(true)}>
                                    Delete my account
                                </button>
                            </p>
                        </Fragment>
                        : <Fragment>
                            <p className={style.paragraph}>
                                You cannot delete your account right now as you still have items in the Store. You have to either
                                transfer them to someone else, or mark them as deprecated in order to delete your account.
                            </p>
                            <p className={style.paragraph}>
                                <a href={Routes.STORE_MANAGE}>Go to the Replugged Store</a>
                            </p>
                        </Fragment>}

                    {deletingAccount && (
                        <Modal
                            title="Delete my account"
                            onClose={() => setDeletingAccount(false)}
                            onConfirm={() => (location.pathname = Endpoints.YEET_ACCOUNT)}
                            closeText='Cancel'
                            confirmText='Delete'
                            color='red'
                        >
                            <div>Are you sure you want to delete your account? This operation is irreversible!</div>
                        </Modal>
                    )}
                </div>
                <Profile user={user} />
            </div>
        </main>
    )
}