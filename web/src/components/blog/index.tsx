import { VNode } from "preact";
import Router, { Route } from "preact-router";
import { Article } from "./utils";
import ARTICLES from "./articles";
import { Routes } from "../../constants";
import style from "./blog.module.css";
import sharedStyle from "../shared.module.css";
import { useTitle } from "hoofd/preact";
import { Redirect } from "../App";

function BlogHome(): VNode {
  useTitle("Blog");

  return (
    <main>
      <div className={style.titleWrapper}>
        <h1 class={style.title}>Replugged Blog</h1>
      </div>
      <div className={style.listGrid}>
        {ARTICLES.map((article) => (
          <a
            class={sharedStyle.linkWrap}
            href={Routes.BLOG_ITEM(article.meta.slug)}
            key={article.meta.slug}>
            <div class={style.listItem}>
              <h2 class={style.listHeader}>{article.meta.title}</h2>
              <p class={style.listDescription}>{article.meta.description}</p>

              <div class={style.listButton}>
                <a class={sharedStyle.buttonLink} href={Routes.BLOG_ITEM(article.meta.slug)}>
                  View Article
                </a>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

export default function Blog(): VNode {
  return (
    <Router>
      {ARTICLES.map((article) => (
        <Route
          key={article.meta.slug}
          path={Routes.BLOG_ITEM(article.meta.slug)}
          component={() => <Article meta={article.meta} Content={article.Content} />}
        />
      ))}
      <Route path={Routes.BLOG} component={BlogHome} />
      <Redirect default to={Routes.BLOG} />
    </Router>
  );
}
