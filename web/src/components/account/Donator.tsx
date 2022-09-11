// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';

import { Routes } from '../../constants';

import style from './donator.module.css';
import sharedStyle from '../shared.module.css';


export default function RepluggedCutie () {
  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <div className={style.body}>
          <h3 className={style.title}>Support Replugged's Development</h3>
          <div className={style.subtitle}>And get sweet perks</div>

          <div className={style.tier}>
            <div>
              <div className={style.price}>$1 USD/month</div>
              <p className={style.description}>
                Replugged Donator profile badge (customizable color) and access to private Discord channel
              </p>
            </div>
          </div>
          <div className={style.tier}>
            <div>
              <div className={style.price}>$5/month</div>
              <p className={style.description}>
                Custom Replugged Donator profile badge (choose any image)
              </p>
            </div>
          </div>
          <div className={style.tier}>
            <div>
              <div className={style.price}>$10/month</div>
              <p className={style.description}>
                Custom Replugged Donator server badge for one server (choose any image)
              </p>
            </div>
          </div>

          <div className={style.footer}>
            <a href={Routes.PATREON} target='_blank' rel='noreferrer' class={sharedStyle.button}>Donate on Patreon</a>
          </div>
        </div>
      </div>
    </div>
  );
}
