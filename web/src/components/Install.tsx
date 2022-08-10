// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useTitle } from 'hoofd/preact';

import { Routes } from '../constants';
import install, { InstallResponseType } from '../install';

import styles from './install.module.css';
import sharedStyle from './shared.module.css';

import Zap from 'feather-icons/dist/icons/zap.svg';

import { useEffect, useState } from 'preact/hooks';

type Props = {
  matches: {
    url: string;
  }
}

function capitalizeFirst (string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function InstallPage ({ matches: { url } }: Props) {
  useTitle('Plugin/Theme Installer');

  const [ title, setTitle ] = useState('Loading...');
  const [ description, setDescription ] = useState<string | JSX.Element>('');

  useEffect(() => {
    if (url) {
      if (url.match(/^[\w-]+\/[\w-.]+$/)) {
        url = `https://github.com/${url}`;
      }

      try {
        new URL(url);
      } catch (e) {
        setTitle('Invalid URL');
        return;
      }

      setTitle('Installing plugin/theme...');
      setDescription(<a href={url} target='_blank'>{url}</a>);


      install(url).then((data) => {
        switch (data.code) {
          case InstallResponseType.SUCCESS:
            setTitle('Success!');
            setDescription(<>Please confirm in Discord to install the {data.info.type} <a href={data.info.url}>{data.info.repoName}</a>.</>);
            break;
          case InstallResponseType.ALREADY_INSTALLED:
            setTitle(`${capitalizeFirst(data.info.type)} already installed`);
            setDescription(<>The {data.info.type} <a href={data.info.url}>{data.info.repoName}</a> is already installed.</>);
            break;
          case InstallResponseType.NOT_FOUND:
            setTitle('Not found');
            setDescription(<>Could not find a plugin or theme repository at <a href={url}>{url}</a>.</>);
            break;
          case InstallResponseType.UNREACHABLE:
            setTitle('Unreachable');
            setDescription(<>
              Could not connect to Replugged. Please make sure Discord is open with the latest version of Replugged installed and try again.
              <br />
              <div className={styles.buttons}>
                <a href={Routes.INSTALLATION} className={sharedStyle.button}>
                  {/* @ts-ignore */}
                  <Zap className={sharedStyle.icon} />
                  <span>Install Replugged</span>
                </a>
                <a href={url}>
                  <span>View Plugin Repository</span>
                </a></div>
            </>);
        }
      });
    } else {
      setTitle('No URL provided');
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.centerText}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
