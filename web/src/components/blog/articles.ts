import { lazy } from "preact/compat";
import { ArticleData } from "./utils";
import articleMeta from "./articles.json";

const ARTICLES: ArticleData[] = [
  {
    meta: articleMeta["view-hidden-channels"],
    Content: lazy(() => import("./articles/view-hidden-channels")),
  },
  {
    meta: articleMeta["the-advantages-of-client-mods"],
    Content: lazy(() => import("./articles/the-advantages-of-client-mods")),
  },
];

export default ARTICLES;
