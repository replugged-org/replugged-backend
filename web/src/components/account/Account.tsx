import { type JSX, h, Fragment } from "preact";
import { useContext, useState, useCallback, useMemo } from "preact/hooks";
import { useTitle } from "hoofd/preact";
import { UserFlags } from "../../../../shared/flags.js";

import { TextField } from "../util/Form.jsx";

import Donator from "./Donator";
import Profile from "./Profile";
import Spinner from "../util/Spinner";
import Modal from "../util/Modal";

import UserContext from "../UserContext";
import { Endpoints, Routes } from "../../constants";

import Patreon from "simple-icons/icons/patreon.svg";
import Spotify from "simple-icons/icons/spotify.svg";
import Link from "feather-icons/dist/icons/link.svg";
import Remove from "feather-icons/dist/icons/x-circle.svg";
import Refresh from "feather-icons/dist/icons/rotate-cw.svg";
import AlertCircle from "feather-icons/dist/icons/alert-circle.svg";

import style from "./account.module.css";
import sharedStyle from "../shared.module.css";

type LinkedAccountProps = {
  platform: string;
  icon: typeof Spotify;
  explainer: string | JSX.Element;
  account?: string;
  refreshEndpoint?: string;
};

function LinkedAccount({
  platform,
  icon,
  account,
  explainer,
  refreshEndpoint,
}: LinkedAccountProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!refreshEndpoint) {
      return;
    }

    setRefreshing(true);
    setRefreshError(null);
    const resp = await fetch(refreshEndpoint, { method: "POST" });
    const body = await resp.json();
    setRefreshing(false);

    if (!resp.ok) {
      setRefreshError(body.message);
    }
  }, [refreshEndpoint]);

  return (
    <div className={style.linkedAccount}>
      {h(icon, { className: style.linkedAccountIcon })}
      <div className={style.linkedAccountInfo}>
        <span>{account ?? "No account linked"}</span>
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
            <a
              native
              href={Endpoints.UNLINK_ACCOUNT(platform)}
              className={style.linkedAccountAction}>
              <Remove />
              <span>Unlink</span>
            </a>
          )}
          {!refreshing && account && refreshEndpoint && (
            <button
              className={`${sharedStyle.buttonLink} ${style.linkedAccountAction}`}
              onClick={refresh}>
              <Refresh />
              <span>Refresh</span>
            </button>
          )}
          {refreshing && (
            <div className={style.linkedAccountAction}>
              <Spinner balls />
              <span>Refreshing...</span>
            </div>
          )}
        </div>
      </div>
      <div className={style.linkedAccountExplainer}>{explainer}</div>
      {refreshError && (
        <div className={style.linkedAccountError}>
          <AlertCircle />
          <span>{refreshError}</span>
        </div>
      )}
    </div>
  );
}

function PerksEdit({ onReturn }: { onReturn: () => void }) {
  const user = useContext(UserContext)!;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const originalCutiePerks = useMemo(
    () => ({
      color: user.cutiePerks.color || "",
      badge: user.cutiePerks.badge === "default" ? "" : user.cutiePerks.badge || "",
      title: user.cutiePerks.title === "Replugged Supporter" ? "" : user.cutiePerks.title || "",
    }),
    [],
  );

  const cutiePerks = useMemo(() => ({ ...originalCutiePerks }), []);
  const onSubmit = useCallback(
    async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      // Memoize new values
      cutiePerks.color = (data.get("color") as string) || "";
      cutiePerks.badge = (data.get("badge") as string) || "";
      cutiePerks.title = (data.get("title") as string) || "Replugged Supporter";

      if (
        originalCutiePerks.color === cutiePerks.color &&
        originalCutiePerks.badge === cutiePerks.badge &&
        originalCutiePerks.title === cutiePerks.title
      ) {
        onReturn();
        return;
      }

      setError(void 0);
      setSubmitting(true);
      const res = await fetch(Endpoints.USER_SELF, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cutiePerks: {
            color: cutiePerks.color || null,
            badge: user.cutieStatus.pledgeTier > 1 ? cutiePerks.badge || null : void 0,
            title: user.cutieStatus.pledgeTier > 1 ? cutiePerks.title || null : void 0,
          },
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.message);
        setSubmitting(false);
        return;
      }

      user.patch(body);
      onReturn();
    },
    [originalCutiePerks, cutiePerks, user],
  );

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div className={style.perksManagementError}>
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}
      <TextField
        name="color"
        label="Badge Color"
        note={
          "Color of your Replugged badges, in hex (without the #). Has no effect if you use a custom icon and you don't have other badges. Leave blank for default blurple."
        }
        value={cutiePerks.color}
      />
      {user.cutieStatus.pledgeTier > 1 && (
        <Fragment>
          <TextField
            name="badge"
            label="Badge Icon"
            note={
              "Icon to set as your custom badge. URL must be from Discord (no external links). Leave blank for the colored hibiscus."
            }
            value={cutiePerks.badge}
          />
          <TextField
            name="title"
            label="Badge Title"
            note={
              "Tooltip text showing when people hover your badge. Leave blank for default text."
            }
            value={cutiePerks.title}
          />

          <div className={style.perksManagementNotice}>
            <span>
              You are not allowed to use any official Discord badge, nor Replugged's. Badge updates
              are monitored and inappropriate ones will be reset. Repeated offenders may see their
              access to Replugged Supporter perks revoked.
            </span>
          </div>
        </Fragment>
      )}

      <button className={sharedStyle.button} disabled={submitting} type="submit">
        {submitting ? <Spinner balls /> : "Save perks"}
      </button>
    </form>
  );
}

function ManagePerks() {
  const user = useContext(UserContext)!;
  const [editing, setEditing] = useState(false);

  return (
    <div className={style.perksManagement}>
      <h2 className={style.title}>Replugged Supporter Perks</h2>
      {editing ? (
        <PerksEdit onReturn={() => setEditing(false)} />
      ) : (
        <Profile user={user} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}

export default function Account() {
  useTitle("My Account");
  const user = useContext(UserContext)!;
  const [deletingAccount, setDeletingAccount] = useState(false);

  return (
    <main>
      <h1 className={style.title}>Welcome back, {user.username}</h1>
      <div className={style.columns}>
        <div className={style.linkedAccounts}>
          <h2 className={style.title}>Linked Accounts</h2>
          <LinkedAccount
            platform="patreon"
            icon={Patreon}
            account={user.accounts.patreon}
            explainer={
              "Link your Patreon account to benefit from the Replugged Supporter perks, and manage them from here. If you pledged but don't see your perks, use the refresh button."
            }
            refreshEndpoint={Endpoints.USER_REFRESH_PLEDGE}
          />
          <hr className={style.separator} />
          <h2 className={style.title}>Delete my account</h2>
          {(user.flags & UserFlags.STORE_PUBLISHER) === 0 ? (
            <Fragment>
              <p className={style.paragraph}>
                You can choose to permanently delete your Replugged account. Be careful, this action
                is irreversible and will take effect immediately.
              </p>
              <p className={style.paragraph}>
                We will drop any data we have about you, and you'll no longer be able to benefit
                from features requiring a Replugged account (such as enhanced Spotify plugin,
                settings sync, and more).
              </p>
              <p className={style.paragraph}>
                <button
                  className={`${sharedStyle.buttonLink} ${sharedStyle.red}`}
                  onClick={() => setDeletingAccount(true)}>
                  Delete my account
                </button>
              </p>
            </Fragment>
          ) : (
            <Fragment>
              <p className={style.paragraph}>
                You cannot delete your account right now as you still have items in the Store. You
                have to either transfer them to someone else, or mark them as deprecated in order to
                delete your account.
              </p>
              <p className={style.paragraph}>
                <a href={Routes.STORE_MANAGE}>Go to the Replugged Store</a>
              </p>
            </Fragment>
          )}

          {deletingAccount && (
            <Modal
              title="Delete my account"
              onClose={() => setDeletingAccount(false)}
              onConfirm={() => (location.pathname = Endpoints.YEET_ACCOUNT)}
              closeText="Cancel"
              confirmText="Delete"
              color="red">
              <div>
                Are you sure you want to delete your account? This operation is irreversible!
              </div>
            </Modal>
          )}
        </div>
        {/* TODO: replace null with <Donator /> once we're ready */}
        {user.cutieStatus.pledgeTier ? <ManagePerks /> : null}
      </div>
    </main>
  );
}
