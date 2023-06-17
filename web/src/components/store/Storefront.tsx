import type { VNode } from "preact";
import { useTitle } from "hoofd/preact";
import { Routes } from "../../constants";
import Redirect from "../util/Redirect";
import Router from "preact-router";
import Store from "./Store";
import StoreItemPage from "./StoreItemPage";

export default function Storefront(): VNode {
  useTitle("Store");

  return (
    <Router>
      <Store path={Routes.STORE_PLUGINS} kind="plugin" />
      <Store path={Routes.STORE_THEMES} kind="theme" />
      <StoreItemPage path={Routes.STORE_ITEM} />

      <Redirect path={Routes.STORE} to={Routes.STORE_PLUGINS} />
    </Router>
  );
}
