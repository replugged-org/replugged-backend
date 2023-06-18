import type { VNode } from "preact";
import { Routes } from "../../constants";
import Redirect from "../util/Redirect";
import Router from "preact-router";
import Store from "./Store";
import StoreItemPage from "./StoreItemPage";
import { useEffect, useState } from "preact/hooks";
import { AddonList, getAddons } from "./utils";

export default function Storefront(): VNode {
  const [installedAddons, setInstalledAddons] = useState<AddonList>({
    plugins: [],
    themes: [],
  });

  const updateAddonList = async (): Promise<void> => {
    const res = await getAddons();
    if (res) setInstalledAddons(res);
  };

  useEffect(() => {
    updateAddonList();
  }, []);

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
