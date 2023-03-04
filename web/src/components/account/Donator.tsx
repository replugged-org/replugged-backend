// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';

import style from './donator.module.css';
import { Routes } from '../../constants';

export default function RepluggedCutie () {
  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <div className={style.body}>
          <h3 className={style.title}>Support Replugged's Development</h3>
          <div className={style.subtitle}>And get sweet perks</div>

          <div className={style.tier}>
            <div>
              <div className={style.price}>$1/month</div>
              <p className={style.description}>
                                Get a <b>permanent hibiscus badge</b>, <b>custom badge colors</b> on your profile, and a custom role
                                in our Discord server.
              </p>
            </div>
          </div>
          <div className={style.tier}>
            <div>
              <div className={style.price}>$5/month</div>
              <p className={style.description}>
                                Get a <b>customizable badge</b> (icon &amp; hover text) on your profile, instead of a simple hibiscus.
              </p>
            </div>
          </div>
          <div className={style.tier}>
            <div>
              <div className={style.price}>$10/month</div>
              <p className={style.description}>
                                Get a <b>fully customizable</b> badge for <b>one</b> of your servers, shown next to its name.
              </p>
            </div>
          </div>

          <div className={style.footer}>
            <a href={Routes.PATREON} target='_blank' rel='noreferrer'>Donate on Patreon</a>
          </div>
        </div>
      </div>
    </div>
  );
}
