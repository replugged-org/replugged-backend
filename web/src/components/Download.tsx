// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useTitleTemplate } from 'hoofd/preact';

import style from './download.module.css';
import sharedStyle from './shared.module.css';
import { useState } from 'preact/hooks';

const DOWNLOAD_URL_BASE =  'https://github.com/replugged-org/electron-installer/releases/latest/download/';

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
  files: [ {
    label: 'Download',
    file: 'replugged-installer-windows.exe'
  } ]
}, {
  os: 'macos',
  detect: () => platform.includes('mac'),
  name: 'macOS',
  files: [ {
    label: 'Download for Intel',
    file: 'replugged-installer-macos.dmg'
  }, {
    label: 'Download for Apple Silicon',
    file: 'replugged-installer-macos-arm64.dmg'
  } ]
}, {
  os: 'linux',
  detect: () => platform.includes('linux'),
  name: 'Linux',
  warning: <>
    Not all Linux distributions are supported. If the installer is not able to find your installation or you are using Flatpak, please follow the <a href="#manual">manual installation instructions</a>.
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

export default function Homepage () {
  useTitleTemplate('Replugged');

  const [ selectedOS, setSelectedOS ] = useState<OperatingSystems>(defaultOS);

  const selectedOSData = operatingSystems.find(os => os.os === selectedOS)!;

  // TODO: manual installation instructions

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
    </main>
  );
}

