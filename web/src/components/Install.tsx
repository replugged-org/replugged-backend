// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useTitle } from 'hoofd/preact';

import install, { InstallResponseType } from '../install';

import styles from './install.module.css';
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
            setDescription(<>Please confirm in Discord to install the {data.info.type} <a href={data.info.url} target='_blank'>{data.info.repoName}</a>.</>);
            break;
          case InstallResponseType.ALREADY_INSTALLED:
            setTitle(`${capitalizeFirst(data.info.type)} already installed`);
            setDescription(<>The {data.info.type} <a href={data.info.url} target='_blank'>{data.info.repoName}</a> is already installed.</>);
            break;
          case InstallResponseType.NOT_FOUND:
            setTitle('Not found');
            setDescription(<>Could not find a plugin or theme repository at <a href={url} target='_blank'>{url}</a>.</>);
            break;
          case InstallResponseType.UNREACHABLE:
            setTitle('Unreachable');
            setDescription(<>Could not connect to Replugged. Please make sure Discord is open with the latest version of Replugged installed and try again.</>);
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
