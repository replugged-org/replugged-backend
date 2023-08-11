import type { VNode } from "preact";
import { Routes } from "../../constants";
import Redirect from "../util/Redirect";
import Router from "preact-router";
import Store from "./Store";
import StoreItemPage from "./StoreItemPage";
import { useInstalledAddons } from "./utils";

export default function Storefront(): VNode {
  const { installedAddons, updateAddonList } = useInstalledAddons();

  return (
    <Router>
      <Store
        path={Routes.STORE_PLUGINS}
        kind="plugin"
        installedAddons={installedAddons.plugins}
        updateAddonList={updateAddonList}
      />
      <Store
        path={Routes.STORE_THEMES}
        kind="theme"
        installedAddons={installedAddons.themes}
        updateAddonList={updateAddonList}
      />
      <StoreItemPage
        path={Routes.STORE_ITEM}
        installedAddons={installedAddons}
        updateAddonList={updateAddonList}
      />

      <Redirect path={Routes.STORE} to={Routes.STORE_PLUGINS} />
    </Router>
  );
}
