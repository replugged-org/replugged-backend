// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VNode, h } from "preact";
import { Routes } from "../../constants";
import style from "./footer.module.css";

export default function Footer(): VNode {
  return (
    <footer className={style.container}>
      <div className={style.section}>
        <span>Copyright &copy; 2022-{new Date().getFullYear()} Replugged</span>
        <span>
          Replugged is not affiliated or endorsed by Discord. Discord is a trademark of Discord Inc.
        </span>
      </div>
      <div className={style.section}>
        <a className={style.link} href={Routes.DOCS} target="_blank" rel="noreferrer">
          Developer Guide
        </a>
        <a className={style.link} href={Routes.STATS}>
          Stats
        </a>
        <a className={style.link} href={Routes.BRANDING}>
          Branding
        </a>
        <a className={style.link} href={Routes.GITHUB} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className={style.link} href={Routes.TRANSLATIONS} target="_blank" rel="noreferrer">
          Translations
        </a>
        {/* <a className={style.link} href={Routes.GUIDELINES}>Guidelines</a> */}
        <a className={style.link} href={Routes.TERMS}>
          Terms
        </a>
        <a className={style.link} href={Routes.PRIVACY}>
          Privacy
        </a>
      </div>
    </footer>
  );
}
