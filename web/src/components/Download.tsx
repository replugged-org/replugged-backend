// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useTitleTemplate } from 'hoofd/preact';

import style from './download.module.css';
import sharedStyle from './shared.module.css';
import { useEffect, useState } from 'preact/hooks';
import Clipboard from 'feather-icons/dist/icons/clipboard.svg';
import Check from 'feather-icons/dist/icons/check.svg';
import { Routes } from '../constants';


const DOWNLOAD_URL_BASE =  'https://github.com/replugged-org/electron-installer/releases/latest/download';

type OperatingSystems = 'windows' | 'macos' | 'linux';

interface OperatingSystemData {
  os: OperatingSystems;
  detect: () => boolean;
  name: string;
  warning?: string | JSX.Element;
  files: {
    label: string;
    file: string;
  }[]
}

// @ts-expect-error DOM types are out of date
const platform: string = navigator.userAgentData?.platform.toLowerCase() || navigator.platform.toLowerCase();

const operatingSystems: OperatingSystemData[] = [ {
  os: 'windows',
  detect: () => platform.includes('win'),
  name: 'Windows',
  warning: <>
    If you get a warning that the app can't be opened, click "Run Anyways". You may need to click "more info" to see this option.
  </>,
  files: [ {
    label: 'Download',
    file: 'replugged-installer-windows.exe'
  } ]
}, {
  os: 'macos',
  detect: () => platform.includes('mac'),
  name: 'macOS',
  warning: <>
    If you get a warning that the app can't be opened, right click on the app and select "Open". See <a href="https://support.apple.com/guide/mac-help/apple-cant-check-app-for-malicious-software-mchleab3a043/mac" target="_blank">this article</a> from Apple for more information.
  </>,
  files: [ {
    label: 'Download for Intel',
    file: 'replugged-installer-macos.zip'
  }, {
    label: 'Download for Apple Silicon',
    file: 'replugged-installer-macos-arm64.zip'
  } ]
}, {
  os: 'linux',
  detect: () => platform.includes('linux'),
  name: 'Linux',
  warning: <>
    If the installer is not able to find your installation or you are using Flatpak, please follow the <a href="#manual">manual installation instructions</a>.
  </>,
  files: [ {
    label: 'Download for x86',
    file: 'replugged-installer-linux.AppImage'
  }, {
    label: 'Download for arm64',
    file: 'replugged-installer-linux-arm64.AppImage'
  } ]
} ];

const defaultOS = (operatingSystems.find(os => os.detect()) || operatingSystems[0]).os;

function Code ({ children }: { children: string }) {
  const [ copied, setCopied ] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1500);

      return () => clearTimeout(timeout);
    }
  }, [ copied ]);

  return (
    <div className={style.codeContainer}>
      <code className={style.code}>
        {children}
      </code>
      <button
        className={style.copyButton}
        onClick={() => {
          navigator.clipboard.writeText(children);
          setCopied(true);
        }}
      >
        {/* @ts-ignore */}
        {copied ? <Check className={`${sharedStyle.icon} ${style.copyCheck}`} /> : <Clipboard className={sharedStyle.icon} />}
      </button>
    </div>
  );
}

export default function Homepage () {
  useTitleTemplate('Replugged');

  const [ selectedOS, setSelectedOS ] = useState<OperatingSystems>(defaultOS);

  const selectedOSData = operatingSystems.find(os => os.os === selectedOS)!;

  return (
    <main className={style.container}>
      <div className={style.heading}>
        <div className={style.wrapper}>
          <h1 className={style.title}>Download Replugged</h1>
          <div className={style.downloadContainer}>
            <div className={style.tabs}>
              {operatingSystems.map(os => (
                <button
                  className={`${style.tab} ${sharedStyle.button} ${os.os === selectedOS ? style.selected : ''}`}
                  onClick={() => setSelectedOS(os.os)}
                >
                  {os.name}
                </button>
              ))}
            </div>
            <div className={style.divider} />
            <div className={style.buttons}>
              {selectedOSData.files.map(file => (
                <a
                  className={sharedStyle.button}
                  href={`${DOWNLOAD_URL_BASE}/${file.file}`}
                  target="_blank"
                  download
                >
                  {file.label}
                </a>
              ))}
            </div>
            {selectedOSData.warning && (
              <div className={style.warning}>
                {selectedOSData.warning}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={style.wrapper} >
        <section id="manual" className={style.manual}>
          <h2>Manual Installation</h2>
          <h3>Prerequisites</h3>
          <p>
            <ul>
              <li><a href="https://git-scm.com/downloads" target="_blank">Git</a></li>
              <li><a href="https://nodejs.org/en/" target="_blank">Node.js</a></li>
              <li><a href="https://pnpm.io/installation" target="_blank">pnpm</a>: <Code>npm install -g pnpm</Code></li>
              <li><a href="https://discord.com/download" target="_blank">Discord</a></li>
            </ul>
          </p>
          <h3>Installation</h3>
          <p>
            <ol>
              <li>Clone the repository: <Code>git clone https://github.com/replugged-org/replugged</Code></li>
              <li><code>cd</code> into the repository: <Code>cd replugged</Code></li>
              <li>Install dependencies: <Code>pnpm i</Code></li>
              <li>Build Replugged: <Code>pnpm run bundle</Code></li>
              <li>Fully quit Discord</li>
              <li>Plug into Discord: <Code>pnpm run plug --production</Code>
                <br />
                If you want to specify into a specific Discord version, you can add the platform as an argument: <Code>pnpm run plug --production [stable|ptb|canary|development]</Code>
              </li>
              <li>Reopen Discord</li>
            </ol>
            You can verify it's installed by going into Discord settings and looking for the "Replugged" tab.
          </p>
          <h3>Troubleshooting</h3>
          <p>
            If you're having issues, please reinstall Discord and try steps 5-7 again.
            <br />
            <br />
            Still having issues? Please <a href={Routes.DICKSWORD} target="_blank">join our Discord</a> and create a thread in <a href="https://discord.com/channels/1000926524452647132/1006383180309352538" target="_blank">#support</a> with any errors you're getting and any other information you think might be helpful.
          </p>
        </section>
      </div>
    </main>
  );
}

