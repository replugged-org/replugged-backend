import { VNode } from "preact";
import { CallToAction } from "../utils";
import { Routes } from "../../../constants";
import style from "../blog.module.css";

import ArrowRight from "feather-icons/dist/icons/arrow-right.svg";

export default (): VNode => (
  <>
    <article>
      <p>
        Client mods, also referred to as modded clients, have transformed the Discord experience for
        millions of users. They allow you to modify Discord in many different ways to improve the
        look and feel of the client and add new features. In this blog post, we will explore the
        advantages of client mods for Discord and how they can elevate your Discord usage to new
        heights.
      </p>

      <h2 id="themes">Personalized Interface and Themes</h2>
      <p>
        One of the primary advantages of client mods for Discord is the ability to personalize the
        interface and apply custom themes or skins. While Discord recently added built in themes,
        they are only available to Nitro subscribers and offer extremely limited customization
      </p>

      <p>
        Client mod themes, on the other hand, have virtually limitless customization options. If you
        can think of it, you can probably do it.
      </p>
      <span className={style.featureLink}>
        <a href={Routes.STORE_THEMES} className={style.linkWithIcon}>
          <span>Explore themes for Replugged</span>
          {/* @ts-expect-error aaa */}
          <ArrowRight />
        </a>
      </span>

      <h2 id="plugins">Extended Features and Functionality with Plugins</h2>
      <p>
        Client mods extend the capabilities of Discord by introducing new features and enhancing
        existing ones with the help of plugins. There are virtually no limits to what can be done.
        Some of the many things you can do with client mods include:
      </p>
      <ul>
        <li>
          <a href={Routes.STORE_ITEM_FN("dev.tharki.ShowHiddenChannels")}>See hidden channels</a>
        </li>
        <li>
          <a href={Routes.STORE_ITEM_FN("com.cafeed28.NitroSpoof")}>
            Use custom emojis even without Nitro
          </a>
        </li>
        <li>
          <a href={Routes.STORE_ITEM_FN("lib.evelyn.SpotifyModal")}>
            Control Spotify playback from Discord
          </a>
        </li>
        <li>
          <a href={Routes.STORE_ITEM_FN("dev.kingfish.InvisibleTyping")}>Hide your typing status</a>
        </li>
        <li>
          <a href={Routes.STORE_ITEM_FN("dev.albertp.MemberCount")}>
            See the server's member count in the member list
          </a>
        </li>
        <li>And so much more!</li>
      </ul>

      <span className={style.featureLink}>
        <a href={Routes.STORE_PLUGINS} className={style.linkWithIcon}>
          <span>Explore plugins for Replugged</span>
          {/* @ts-expect-error aaa */}
          <ArrowRight />
        </a>
      </span>

      <h2 id="break-free-from-limitations">Break free from Discord's limitations</h2>
      <p>
        Discord has a lot of restrictions that can be frustrating. Client mods allow you to bypass
        these restrictions and unlock Discord's full potential. For example:
      </p>
      <ul>
        <li>
          <a href={Routes.STORE_ITEM_FN("dev.tharki.ShowHiddenChannels")}>See hidden channels</a>
        </li>
        <li>
          <a href={Routes.STORE_ITEM_FN("com.cafeed28.NitroSpoof")}>
            Use custom emojis even without Nitro
          </a>
        </li>
        <li>
          <a href={Routes.STORE_ITEM_FN("dev.tharki.LegalDiscordBypasses")}>
            Use voice activity even when push to talk is required
          </a>
        </li>
      </ul>
      <h2 id="make-discord-yours">
        Make Discord truly <span className={style.italic}>yours</span>
      </h2>
      <p>
        In conclusion, client mods for Discord offer a wealth of advantages. Change how Discord
        looks, add new features, and break free from Discord's limitations. Client mods allow you to
        make Discord truly <span className={style.italic}>yours</span>. The sky is the limit!
      </p>
    </article>
    <CallToAction />
  </>
);
