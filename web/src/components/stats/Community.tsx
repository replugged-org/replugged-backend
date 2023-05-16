import type { CommunityStats } from "./useStats";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, VNode, h } from "preact";
import { useTitle } from "hoofd/preact";

import Chart from "./Chart";
import useStats from "./useStats";

import style from "./stats.module.css";

function Replugged({ charts }: { charts?: CommunityStats }): VNode {
  return (
    <>
      <Chart
        title="Registered Replugged accounts"
        dataset={charts ? charts.users : false}
        modes={[
          { name: "All Time", key: "allTime" },
          { name: "Last Month", key: "month" },
          { name: "Last Week", key: "week" },
        ]}
      />
      <div className={style.group}>
        <div>
          <h3>Total users</h3>
          <span>{typeof charts !== "undefined" ? charts.numbers.total : "Loading..."}</span>
        </div>
        <div>
          <h3>New users last month</h3>
          <span>{typeof charts !== "undefined" ? charts.numbers.month : "Loading..."}</span>
        </div>
        <div>
          <h3>New users last week</h3>
          <span>{typeof charts !== "undefined" ? charts.numbers.week : "Loading..."}</span>
        </div>
      </div>

      <div className={style.group}>
        <div>
          <h3>Helpers</h3>
          <span>{typeof charts !== "undefined" ? charts.numbers.helpers : "Loading..."}</span>
        </div>
        <div>
          <h3>Published plugins</h3>
          <span>Soon!</span>
        </div>
        <div>
          <h3>Published themes</h3>
          <span>Soon!</span>
        </div>
      </div>
      <p>
        Helpers include community members who contributed in any way to Replugged: Code
        contributors, translators, bug hunters.
      </p>
    </>
  );
}

function Community({ charts }: { charts?: CommunityStats }): VNode | null {
  if (!charts?.guild) {
    return null;
  }

  return (
    <>
      <h2 className={style.sectionTitle}>Replugged's Community Server</h2>
      <Chart
        title="Online people"
        legend={{ online: "Online", idle: "Idle", dnd: "Do Not Disturb" }}
        dataset={charts?.guild.presences}
        modes={[
          { name: "Last Month", key: "month" },
          { name: "Last Week", key: "week" },
          { name: "Last Day", key: "day" },
        ]}
      />

      <Chart
        title="Server members"
        dataset={charts?.guild.users}
        modes={[
          { name: "Last Month", key: "month" },
          { name: "Last Week", key: "week" },
          { name: "Last Day", key: "day" },
        ]}
      />

      <Chart
        title="Messages seen"
        legend={{ sentMessages: "Messages Sent", deletedMessages: "Messages Deleted" }}
        dataset={charts?.guild.messages}
        modes={[
          { name: "Last Month", key: "month" },
          { name: "Last Week", key: "week" },
          { name: "Last Day", key: "day" },
        ]}
      />
    </>
  );
}

export default function Stats(): VNode {
  useTitle("Statistics");
  const charts = useStats();

  return (
    <main>
      <h1>Statistics</h1>
      <p>We love stats. So have stats. It's free. I think.</p>
      <div className="sneaky">
        <p>it just condemned an honest woman to do boring maths for a day</p>
        <p>and the story tells she then had to do more maths for displaying</p>
        <p>-- help me pls i'm just a stupid girl, it's painfullll - cynthia</p>
      </div>

      <Replugged charts={charts} />
      <Community charts={charts} />
    </main>
  );
}
