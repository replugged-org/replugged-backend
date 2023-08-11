import { VNode } from "preact";
import { Routes } from "../../constants";
import { Suspense } from "preact/compat";
import { useTitle } from "hoofd/preact";
import Spinner from "../util/Spinner";

import style from "./blog.module.css";
import sharedStyle from "../shared.module.css";
import Zap from "feather-icons/dist/icons/zap.svg";
import MessageCircle from "feather-icons/dist/icons/message-circle.svg";
import RepluggedLogo from "../../assets/replugged.svg";
import ArrowHeadBack from "feather-icons/dist/icons/chevron-left.svg";

export interface ArticleMeta {
  title: string;
  description: string;
  slug: string;
}

export interface ArticleProps {
  url: string;
}

export interface ArticleData {
  meta: ArticleMeta;
  Content: (props: ArticleProps) => VNode;
}

export const CallToAction = (): VNode => {
  return (
    <div className={style.cta}>
      <div className={style.ctaInner}>
        <div className={style.ctaHeader}>
          {/* @ts-expect-error uhh */}
          <RepluggedLogo className={style.ctaLogo} />
          <div className={style.ctaText}>
            <h2>Install Replugged</h2>
            <p className={style.ctaMotto}>
              Replugged is the best way to enhance your Discord experience and make Discord truly{" "}
              <span class={style.italic}>yours</span>. Download it today!
            </p>
          </div>
        </div>

        <div className={style.ctaButtons}>
          <a href={Routes.DOWNLOAD} className={sharedStyle.button}>
            {/* @ts-expect-error class */}
            <Zap className={sharedStyle.icon} />
            <span>Download</span>
          </a>
          <a href={Routes.DICKSWORD} className={sharedStyle.buttonLink}>
            {/* @ts-expect-error class */}
            <MessageCircle className={sharedStyle.icon} />
            <span>Discord Server</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export const Article = ({ meta, Content }: ArticleData): VNode => {
  useTitle(meta.title);

  return (
    <main className={style.container}>
      <div class={`${style.spaced} ${style.titleWrapper}`}>
        <a href={Routes.BLOG} class={sharedStyle.buttonLink}>
          {/* @ts-expect-error bruh */}
          <ArrowHeadBack /> Back
        </a>
        <h1 className={style.title}>{meta.title}</h1>
      </div>
      <Suspense fallback={<Spinner />}>
        <Content url={Routes.BLOG_ITEM(meta.slug)} />
      </Suspense>
    </main>
  );
};
