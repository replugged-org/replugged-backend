import type { Attributes } from "preact";
import { VNode } from "preact";
import style from "./store.module.css";
import sharedStyle from "../shared.module.css";
import formStyle from "../util/form.module.css";
import { UseInfiniteQueryResult, useInfiniteQuery } from "@tanstack/react-query";
import { useTitle } from "hoofd";
import { PaginatedStore, StoreItem } from "../../../../types/store";
import install from "../../install";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "preact/hooks";
import Spinner from "../util/Spinner";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "react-use";
import { toArray } from "../util/misc";

type StoreKind = "plugin" | "theme";

type StoreProps = Attributes & { kind: StoreKind };

const LABELS: Record<StoreKind, string> = {
  plugin: "Plugins",
  theme: "Themes",
};

const toastIdMap = new Map<string, string>();

function installAddon(identifier: string): Promise<void> {
  if (toastIdMap.has(identifier)) {
    // Dismiss any existing toasts for the same addon
    toast.dismiss(toastIdMap.get(identifier)!);
  }

  const toastId = toast.loading("Connecting...");
  toastIdMap.set(identifier, toastId);

  let lastToast = Date.now();
  let state: "connecting" | "installing" | "done" = "connecting";

  return new Promise((resolve) => {
    install({
      data: {
        identifier,
      },
      onConnect: () => {
        state = "installing";
        const waitToToast = Math.max(0, 500 - (Date.now() - lastToast));
        setTimeout(() => {
          if (state !== "installing") return;
          toast.loading(
            "Connected to Replugged, please confirm the addon installation in Discord.",
            {
              id: toastId,
            },
          );
          lastToast = Date.now();
        }, waitToToast);
      },
      onFinish: (res) => {
        state = "done";
        const waitToToast = Math.max(0, 500 - (Date.now() - lastToast));

        setTimeout(() => {
          switch (res.kind) {
            case "SUCCESS":
              toast.success(`${res.manifest.name} was successfully installed.`, {
                id: toastId,
              });
              break;
            case "ALREADY_INSTALLED":
              toast.error(`${res.manifest.name} is already installed.`, {
                id: toastId,
              });
              break;
            case "FAILED":
              toast.error("Failed to get addon info.", {
                id: toastId,
              });
              break;
            case "CANCELLED":
              toast.error("Installation cancelled.", {
                id: toastId,
              });
              break;
            case "UNREACHABLE":
              toast.error(
                "Could not connect to Replugged, please make Discord is open with the latest version of Replugged installed and try again.",
                {
                  id: toastId,
                },
              );
              break;
          }

          resolve();
        }, waitToToast);
      },
    });
  });
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

function Item(item: StoreItem): VNode {
  const [isInstalling, setIsInstalling] = useState(false);

  const authors = formatAuthors(item.author);

  return (
    <div class={style.item}>
      <div>
        <h2 class={style.itemHeader}>{item.name}</h2>
        <p class={style.itemAuthor}>by {authors}</p>
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

function LoadMore({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: UseInfiniteQueryResult<PaginatedStore>): VNode | null {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;

  return (
    <button
      class={`${sharedStyle.button} ${style.loadMoreButton}`}
      onClick={() => fetchNextPage()}
      ref={ref}
      disabled={isFetchingNextPage}>
      {isFetchingNextPage ? "Loading..." : "Load More"}
    </button>
  );
}

function StoreBody(
  props: UseInfiniteQueryResult<PaginatedStore> & {
    items: StoreItem[];
    query: string;
  },
): VNode {
  if (props.isLoading) {
    return <Spinner class={style.fullGrid} />;
  }

  if (props.isError) {
    return <p class={style.fullGrid}>Failed to load store items.</p>;
  }

  if (props.items.length === 0) {
    return <p class={style.fullGrid}>{props.query ? "No results found" : "No items found"}</p>;
  }

  return (
    <>
      {props.items.map(Item)}
      <LoadMore {...props} />
    </>
  );
}

export default function Store({ kind }: StoreProps): VNode {
  useTitle("Plugins");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    500,
    [query],
  );

  const itemsQuery = useInfiniteQuery<PaginatedStore>({
    queryKey: ["store", kind, debouncedQuery],
    queryFn: async ({ pageParam: page }) => {
      const queryString = new URLSearchParams({
        page: page?.toString() ?? "1",
        items: (12).toString(),
        query: debouncedQuery,
      });

      const res = await fetch(`/api/store/list/${kind}?${queryString}`);
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 404 && json.error === "NOT_FOUND") {
          return { numPages: 0, page: 1, results: [] };
        }

        throw new Error("Failed to fetch store items.");
      }
      return json;
    },
    getNextPageParam: (lastPage) => {
      const { page, numPages } = lastPage;
      if (page >= numPages) return undefined;
      return page + 1;
    },
  });

  const items = itemsQuery.data?.pages.map((page) => page.results).flat() ?? [];

  return (
    <main class={style.main}>
      <h1 class={style.header}>{LABELS[kind]}</h1>
      <div class={style.grid}>
        {items.length > 0 || debouncedQuery ? (
          <input
            class={`${formStyle.textField} ${style.search}`}
            type="text"
            placeholder="Search"
            value={query}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
        ) : null}
        <StoreBody {...itemsQuery} items={items} query={query} />
      </div>
    </main>
  );
}
