import { lazy } from "preact/compat";
import { ArticleData } from "./utils";
import articleMeta from "./articles.json";

const ARTICLES: ArticleData[] = [
  {
    meta: articleMeta["view-hidden-channels"],
    Content: lazy(() => import("./articles/view-hidden-channels")),
  },
];

export default ARTICLES;
