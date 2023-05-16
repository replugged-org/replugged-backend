import {
  VNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
} from "preact";
import type { MinimalUser } from "../../../types/users";
import { useEffect, useState } from "preact/hooks";
import { useTitle } from "hoofd/preact";

import Spinner from "./util/Spinner";
import Avatar from "./util/Avatar";

import { Endpoints } from "../constants";

import style from "./contributors.module.css";

type ContributorUser = MinimalUser & { github?: string };

interface AllContributors {
  developers: ContributorUser[];
  staff: ContributorUser[];
  contributors: ContributorUser[];
}

function Contributor({ user }: { user: ContributorUser }): VNode {
  return (
    <div className={style.container}>
      <Avatar user={user} />
      <div className={style.name}>
        <div className={style.username}>
          {user.username}
          <span className={style.discriminator}>#{user.discriminator}</span>
        </div>
      </div>
    </div>
  );
}

export default function Contributors(): VNode {
  useTitle("Contributors");

  const [contributors, setContributors] = useState<AllContributors | null>(null);
  useEffect(() => {
    fetch(Endpoints.CONTRIBUTORS)
      .then((r) => r.json())
      .then((c) => setContributors(c))
      .catch((e) => console.error(e));
  }, []);

  if (!contributors) {
    return (
      <main>
        <Spinner />
      </main>
    );
  }

  return (
    <main>
      <h2 className={style.section}>Developers</h2>
      <div className={style.wrapper}>
        {contributors.developers.map((user) => (
          <Contributor key={user._id} user={user} />
        ))}
      </div>
      <h2 className={style.section}>Replugged Staff &amp; Support</h2>
      <div className={style.wrapper}>
        {contributors.staff.map((user) => (
          <Contributor key={user._id} user={user} />
        ))}
      </div>
      <h2 className={style.section}>Contributors</h2>
      <div className={style.wrapper}>
        {contributors.contributors.map((user) => (
          <Contributor key={user._id} user={user} />
        ))}
      </div>
    </main>
  );
}
