import type { Attributes } from "preact";
import { VNode } from "preact";
import style from "./store.module.css";
import sharedStyle from "../shared.module.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTitle } from "hoofd";
import { PaginatedStore, StoreItem } from "../../../../types/store";
import install from "../../install";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "preact/hooks";
import Spinner from "../util/Spinner";
import { useInView } from "react-intersection-observer";

type StoreKind = "plugin" | "theme";

type StoreProps = Attributes & { kind: StoreKind };

const LABELS: Record<StoreKind, string> = {
  plugin: "Plugins",
  theme: "Themes",
};
function installAddon(identifier: string): Promise<void> {
  // Dismiss any existing toasts for the same addon
  toast.dismiss(identifier);

  return new Promise((resolve) => {
    install({
      data: {
        identifier,
      },
      onConnect: () => {
        toast.loading("Connected to Replugged, please confirm the addon installation in Discord.", {
          id: identifier,
        });
      },
      onFinish: (res) => {
        // toast.dismiss(identifier);
        switch (res.kind) {
          case "SUCCESS":
            toast.success(`${res.manifest.name} was successfully installed.`, {
              id: identifier,
            });
            break;
          case "ALREADY_INSTALLED":
            toast.error(`${res.manifest.name} is already installed.`, {
              id: identifier,
            });
            break;
          case "FAILED":
            toast.error("Failed to get addon info.", {
              id: identifier,
            });
            break;
          case "CANCELLED":
            toast.error("Installation cancelled.", {
              id: identifier,
            });
            break;
          case "UNREACHABLE":
            toast.error(
              "Could not connect to Replugged, please make Discord is open with the latest version of Replugged installed and try again.",
              {
                id: identifier,
              },
            );
            break;
        }

        resolve();
      },
    });
  });
}

function Item(item: StoreItem): VNode {
  const [isInstalling, setIsInstalling] = useState(false);

  return (
    <div class={style.item}>
      <div>
        <h2 class={style.itemHeader}>{item.name}</h2>
        <p class={style.itemDescription}>{item.description}</p>
      </div>
      <button
        class={`${sharedStyle.button} ${style.itemButton}`}
        onClick={async () => {
          setIsInstalling(true);
          await installAddon(item.id);
          setIsInstalling(false);
        }}
        disabled={isInstalling}>
        {isInstalling ? "Installing..." : "Install"}
      </button>
    </div>
  );
}

function LoadMore(props: {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}): VNode | null {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !props.isFetchingNextPage && props.hasNextPage) props.fetchNextPage();
  }, [inView, props.hasNextPage, props.isFetchingNextPage, props.fetchNextPage]);

  if (!props.hasNextPage) return null;

  return (
    <button
      class={`${sharedStyle.button} ${style.loadMoreButton}`}
      onClick={props.fetchNextPage}
      ref={ref}
      disabled={props.isFetchingNextPage}>
      {props.isFetchingNextPage ? "Loading..." : "Load More"}
    </button>
  );
}

export default function Store({ kind }: StoreProps): VNode {
  useTitle("Plugins");

  const { isLoading, isError, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PaginatedStore>({
      queryKey: ["store", kind],
      queryFn: async ({ pageParam: page }) => {
        const query = new URLSearchParams({
          page: page?.toString() ?? "1",
          items: (12).toString(),
        });

        const res = await fetch(`/api/store/list/${kind}?${query}`);
        if (!res.ok) throw new Error("Failed to fetch store items.");
        return res.json();
      },
      getNextPageParam: (lastPage) => {
        const { page, numPages } = lastPage;
        if (page >= numPages) return undefined;
        return page + 1;
      },
    });

  if (isLoading) {
    return (
      <main class={style.main}>
        <h1 class={style.header}>{LABELS[kind]}</h1>
        <Spinner />
      </main>
    );
  }
  if (isError) {
    return (
      <main class={style.main}>
        <h1 class={style.header}>{LABELS[kind]}</h1>
        <p>Failed to load store items.</p>
      </main>
    );
  }

  const items = data?.pages.map((page) => page.results).flat() ?? [];

  return (
    <main class={style.main}>
      <h1 class={style.header}>{LABELS[kind]}</h1>
      <div class={style.grid}>{items.map(Item)}</div>
      <LoadMore
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </main>
  );
}
