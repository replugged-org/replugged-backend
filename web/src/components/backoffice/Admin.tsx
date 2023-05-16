// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, VNode, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useTitle } from "hoofd/preact";
import Router from "preact-router";
import { Link } from "preact-router/match";

import LayoutWithSidebar from "../layout/LayoutWithSidebar";
import Redirect from "../util/Redirect";
import { SoonRoute } from "../util/Soon";
import Users from "./UsersOld/Manage";
import UsersManage from "./Users/Manage";
import Forms from "./Store/Forms";

import { Endpoints, Routes } from "../../constants";

import Smile from "feather-icons/dist/icons/smile.svg";
import Shield from "feather-icons/dist/icons/shield.svg";
import Activity from "feather-icons/dist/icons/activity.svg";

import Package from "feather-icons/dist/icons/package.svg";
import Tag from "feather-icons/dist/icons/tag.svg";
import Layout from "feather-icons/dist/icons/layout.svg";
import Alert from "feather-icons/dist/icons/alert-octagon.svg";

import Inbox from "feather-icons/dist/icons/inbox.svg";
import Flag from "feather-icons/dist/icons/flag.svg";

import CodeSandbox from "feather-icons/dist/icons/codesandbox.svg";

import style from "./admin.module.css";

function Sidebar(): VNode {
  // Unread badges
  const [unread, setUnread] = useState({ forms: 0, reports: 0 });
  const [totalUsers, setTotalUsers] = useState<number>(0);
  useEffect(() => {
    fetch(Endpoints.BACKOFFICE_FORMS_COUNT)
      .then((r) => r.json())
      .then((d) => {
        setUnread({
          forms: d.publish + d.verification + d.hosting,
          reports: d.reports,
        });
      });

    fetch(Endpoints.BACKOFFICE_USER_COUNT)
      .then((r) => r.json())
      .then((d) => {
        setTotalUsers(d);
      });
  }, []);

  return (
    <Fragment>
      <h1>Administration</h1>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_USERS}>
        <Smile />
        <span>Users {totalUsers > 0 ? `(${totalUsers})` : ""}</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_BANS}>
        <Shield />
        <span>Bans</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_MONITORING}>
        <Activity />
        <span>Abuse Monitoring</span>
      </Link>

      <h3>Store management</h3>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_ITEMS}>
        <Package />
        <span>Items</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_TAGS}>
        <Tag />
        <span>Tags</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_FRONT}>
        <Layout />
        <span>Frontpage</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_THREATS}>
        <Alert />
        <span>Known Threats</span>
      </Link>

      <h3>Store submissions</h3>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_FORMS}>
        <Inbox />
        <span>Forms</span>
        {Boolean(unread.forms) && <span className={style.unread}>{unread.forms}</span>}
      </Link>
      <Link
        class={style.item}
        activeClassName={style.active}
        href={Routes.BACKOFFICE_STORE_REPORTS}>
        <Flag />
        <span>Reports</span>
        {Boolean(unread.reports) && <span className={style.unread}>{unread.reports}</span>}
      </Link>

      <h3>Community</h3>
      <Link
        class={style.item}
        activeClassName={style.active}
        href={Routes.BACKOFFICE_EVENTS_SECRET}>
        <CodeSandbox />
        <span>Super Secret Event</span>
      </Link>
    </Fragment>
  );
}

export default function Admin(): VNode {
  useTitle("Replugged Admin");

  return (
    <LayoutWithSidebar>
      <Sidebar />
      <Router>
        {/* @ts-expect-error idk */}
        <Users path={Routes.BACKOFFICE_USERS} />
        {/* @ts-expect-error idk */}
        <UsersManage path={Routes.BACKOFFICE_USERS_MANAGE(":id")} />

        <SoonRoute path={Routes.BACKOFFICE_BANS}>
          <div>banned users</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_MONITORING}>
          <div>monitoring</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_STORE_ITEMS}>
          <div>store items</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_STORE_TAGS}>
          <div>store tags</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_STORE_FRONT}>
          <div>store front</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_THREATS}>
          <div>threats</div>
        </SoonRoute>

        {/* @ts-expect-error idk */}
        <Forms path={Routes.BACKOFFICE_STORE_FORMS} />

        <SoonRoute path={Routes.BACKOFFICE_STORE_REPORTS}>
          <div>reports</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_EVENTS_SECRET}>
          <div>eyes</div>
        </SoonRoute>
        <Redirect default to={Routes.BACKOFFICE_USERS} />
      </Router>
    </LayoutWithSidebar>
  );
}
