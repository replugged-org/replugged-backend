import { VNode } from "preact";
import { StandaloneStoreItem } from "../../store/Store";
import style from "../blog.module.css";
import { Routes } from "../../../constants";
import { CallToAction } from "../utils";

export default (): VNode => (
  <>
    <article>
      <p>
        Do you ever feel intrigued by the hidden channels lurking within your favorite Discord
        servers? You're not alone! Many servers have private channels that pique our curiosity. Some
        channels might be exclusive to server staff, while others may be reserved for VIPs.
        Regardless of their purpose, these hidden channels are often shrouded in mystery. With the
        assistance of Replugged and our "Show Hidden Channels" plugin, you can now see all of the
        hidden channels in any Discord server!
      </p>
      <h2 id="install-replugged">Step 1: Download and Install Replugged</h2>

      <ol>
        <li>
          Visit our{" "}
          <a href={Routes.DOWNLOAD} target="_blank">
            download page
          </a>
          .
        </li>
        <li>Choose your operating system from the options provided.</li>
        <li>Click on the "Download" button.</li>
        <li>Run the installer that you've just downloaded.</li>
        <li>Follow the installation prompts to install Replugged into your Discord app.</li>
      </ol>

      <h2 id="install-show-hidden-channels">Step 2: Install the Show Hidden Channels Plugin</h2>
      <ol>
        <li>Click on the "Install" button presented below.</li>
        <li>In your Discord app, confirm the installation of the plugin.</li>
        <li>If prompted, click "Reload" to finalize the installation.</li>
      </ol>

      <StandaloneStoreItem
        id="dev.tharki.ShowHiddenChannels"
        className={style.storeItemCard}
        openInNewTab={true}
      />

      <h2 id="reveal-the-channels">Step 3: Reveal the Hidden Channels!</h2>

      <p>
        Now that you have Replugged and ShowHiddenChannels installed, you're ready to go! Just pick
        any Discord server and you will now be able to see all of the channels in the server, even
        the ones you don't have access to. These channels have a lock icon next to their name to
        indicate that they are hidden. If you think some channels are missing, open the "Browse
        Channels" tab or right click on the server icon and click "Show All Channels" to find
        channels that are disabled by default.
      </p>

      <h2 id="whats-the-catch">What's the catch?</h2>

      <p>
        You might be thinking, "How is this possible? No way it's this easy to see hidden channels!
        Why make channels private at all if it is this easy?" Well, there is a catch. While you can
        see the channels and their information, you cannot actually view the messages in the channel
        or interact with it. Discord restricts access to these channels on their end, so there is no
        way to get around this.
      </p>

      <h2 id="what-can-you-see">So what can you see then?</h2>
      <p>
        Well, beyond the channel names, you can also see some other information about the channel.
        <ol>
          <li>The channel's topic</li>
          <li>Who can view the channel</li>
          <li>When the last message was sent in that channel</li>
        </ol>
      </p>

      <h2 id="conclusion">And that's it!</h2>
      <p>
        You now know how to see hidden channels in Discord! If you have any questions or need help,
        join our{" "}
        <a href={Routes.DICKSWORD} target="_blank">
          Discord server
        </a>{" "}
        and ask in the #support channel, and we'll be happy to help you out!
      </p>
    </article>
    <CallToAction />
  </>
);
