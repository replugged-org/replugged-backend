import type { Attributes } from "preact";
import { VNode } from "preact";
import style from "./storeItemPage.module.css";
import sharedStyle from "../shared.module.css";
import { useQuery } from "@tanstack/react-query";
import { useTitle } from "hoofd/preact";
import { StoreItem } from "../../../../types/store";
import { useState } from "preact/hooks";
import Spinner from "../util/Spinner";
import { AddonList, installAddon } from "./utils";
import { toArray } from "../util/misc";
import { RouteError } from "../../types";
import ArrowHeadBack from "feather-icons/dist/icons/chevron-left.svg";
import { Routes } from "../../constants";

type StoreItemPageProps = Attributes & {
  id?: string;
  installedAddons: AddonList;
  updateAddonList: () => Promise<void>;
};

type StoreKind = "plugin" | "theme";

const TYPES: Record<StoreItem["type"], StoreKind> = {
  "replugged-plugin": "plugin",
  "replugged-theme": "theme",
};

const LIST_ROUTES: Record<StoreKind, string> = {
  plugin: Routes.STORE_PLUGINS,
  theme: Routes.STORE_THEMES,
};

const LABELS: Record<StoreKind, string> = {
  plugin: "Plugins",
  theme: "Themes",
};

function Install({
  id,
  installed,
  updateAddonList,
}: {
  id: string;
  installed: boolean;
  updateAddonList: () => Promise<void>;
}): VNode {
  const [isInstalling, setIsInstalling] = useState(false);

  return (
    <button
      class={`${sharedStyle.button} ${style.itemButton}`}
      onClick={async () => {
        setIsInstalling(true);
        await installAddon(id, updateAddonList);
        setIsInstalling(false);
      }}
      disabled={installed || isInstalling}>
      {installed ? "Installed" : isInstalling ? "Installing..." : "Install"}
    </button>
  );
}

const formatAuthors = (authors: StoreItem["author"]): string => {
  const authorNames = toArray(authors).map((author) => author.name);

  if (authorNames.length === 0) return "unknown"; // Should never happen

  if (authorNames.length === 1) {
    return `${authorNames[0]}`;
  }
  if (authorNames.length === 2) {
    return `${authorNames[0]} and ${authorNames[1]}`;
  }
  if (authorNames.length === 3) {
    return `${authorNames[0]}, ${authorNames[1]}, and ${authorNames[2]}`;
  }

  return `${authorNames[0]}, ${authorNames[1]}, ${authorNames[2]}, and ${
    authorNames.length - 3
  } more`;
};

function getError(data: StoreItem | RouteError | undefined): string | undefined {
  if (data && !("error" in data)) {
    // @ts-expect-error Not adding to type for convenience
    if (data.type === "replugged") return "Addon not found.";
    return undefined;
  }
  const genericError = "Failed to load.";
  if (!data) return genericError;
  const { error } = data;
  if (error === 404) return "Addon not found.";
  return genericError;
}

export default function StoreItemPage({
  id: inputId,
  installedAddons,
  updateAddonList,
}: StoreItemPageProps): VNode {
  const { isLoading, data } = useQuery<StoreItem | RouteError>(["store", inputId], () =>
    fetch(`/api/store/${inputId}`).then((res) => res.json()),
  );

  if (isLoading) {
    return (
      <main>
        <Spinner />
      </main>
    );
  }

  const error = getError(data);
  if (error) {
    return (
      <main>
        <h1 class={sharedStyle.header}>{error}</h1>
      </main>
    );
  }
  const item = data as StoreItem;
  const { id, name, description, author, version, license, source } = item;

  const kind = TYPES[item.type];
  const label = LABELS[kind];
  const listRoute = LIST_ROUTES[kind];
  const installed = Object.values(installedAddons).flat().includes(id);

  useTitle(`${name} - Replugged ${label}`);

  const details: Array<{
    label: string;
    value: string | VNode | null | undefined;
    truncate?: boolean;
  }> = [
    { label: "Author", value: formatAuthors(author) },
    { label: "Version", value: `v${version}` },
    { label: "License", value: license },
    {
      label: "Source",
      value: source ? (
        <a href={source} target="_blank">
          {source}
        </a>
      ) : null,
      truncate: true,
    },
  ];

  const images = toArray(item.image);

  return (
    <main>
      <div class={style.wrapper}>
        <div class={style.main}>
          <a href={listRoute} class={sharedStyle.buttonLink}>
            {/* @ts-expect-error bruh */}
            <ArrowHeadBack /> Back to {label}
          </a>
          <h1 class={sharedStyle.header}>{name}</h1>
          <p class={style.description}>{description}</p>
          <div class={style.images}>
            {images.map((image) => (
              <img src={image} alt="" />
            ))}
          </div>
        </div>
        <div class={style.sidebar}>
          <Install id={id} installed={installed} updateAddonList={updateAddonList} />
          <h2 class={style.detailsHeader}>Details</h2>
          <p class={style.details}>
            {details.map(({ label, value, truncate }) => {
              if (!value) return null;
              return (
                <span class={truncate ? style.truncate : undefined}>
                  <span class={style.label}>{label}: </span>
                  {value}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </main>
  );
}
