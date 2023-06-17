import type { Attributes } from "preact";
import { VNode } from "preact";
import style from "./store.module.css";
import sharedStyle from "../shared.module.css";
import formStyle from "../util/form.module.css";
import { UseInfiniteQueryResult, useInfiniteQuery } from "@tanstack/react-query";
import { useTitle } from "hoofd/preact";
import { PaginatedStore, StoreItem } from "../../../../types/store";
import { useEffect, useState } from "preact/hooks";
import Spinner from "../util/Spinner";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "react-use";
import { toArray } from "../util/misc";
import { installAddon } from "./utils";
import { Routes } from "../../constants";

type StoreKind = "plugin" | "theme";

type StoreProps = Attributes & { kind: StoreKind };

const LABELS: Record<StoreKind, string> = {
  plugin: "Plugins",
  theme: "Themes",
};

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
    <a class={sharedStyle.linkWrap} href={Routes.STORE_ITEM_FN(item.id)}>
      <div class={style.item}>
        <div>
          <h2 class={style.itemHeader}>{item.name}</h2>
          <p class={style.itemAuthor}>by {authors}</p>
          <p class={style.itemDescription}>{item.description}</p>
        </div>
        <div class={style.itemButton}>
          {" "}
          <a class={sharedStyle.buttonLink} href={Routes.STORE_ITEM_FN(item.id)}>
            Details
          </a>
          <button
            class={sharedStyle.button}
            onClick={async () => {
              setIsInstalling(true);
              await installAddon(item.id);
              setIsInstalling(false);
            }}
            disabled={isInstalling}>
            {isInstalling ? "Installing..." : "Install"}
          </button>
        </div>
      </div>
    </a>
  );
}

function LoadMore({
  minPage,
  maxPage,
  fetchPreviousPage,
  fetchNextPage,
  isFetchingPreviousPage,
  isFetchingNextPage,
  hasNextPage,
}: UseInfiniteQueryResult<PaginatedStore> & { minPage: number; maxPage: number }): VNode | null {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && minPage === 1) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, minPage]);

  const hasPreviousPage = minPage > 1;
  console.log(minPage, maxPage, hasPreviousPage, hasNextPage);
  if (!hasPreviousPage && !hasNextPage) return null;

  return (
    <div class={style.scrollButtons} ref={ref}>
      <a
        class={`${sharedStyle.button} ${style.loadMoreButton}`}
        rel="prev"
        href={`?page=${minPage - 1}`}
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, "", `?page=${minPage - 1}`);
          fetchPreviousPage();
        }}
        disabled={isFetchingPreviousPage || !hasPreviousPage}>
        {isFetchingPreviousPage ? "Loading..." : "Previous"}
      </a>
      <a
        rel={hasPreviousPage ? "next" : undefined}
        href={`?page=${maxPage + 1}`}
        class={`${sharedStyle.button} ${style.loadMoreButton}`}
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, "", `?page=${maxPage + 1}`);
          fetchNextPage();
        }}
        disabled={isFetchingNextPage || !hasNextPage}>
        {isFetchingNextPage ? "Loading..." : "Next"}
      </a>
    </div>
  );
}

function StoreBody(
  props: UseInfiniteQueryResult<PaginatedStore> & {
    items: StoreItem[];
    minPage: number;
    maxPage: number;
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
      <div className={`${style.fullGrid} ${style.loadMoreWrapper}`}>
        <LoadMore {...props} />
      </div>
    </>
  );
}

export default function Store({ kind }: StoreProps): VNode {
  useTitle(`Replugged ${LABELS[kind]}`);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const pageQuery = new URLSearchParams(location.search).get("page");

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
        page: page?.toString() ?? pageQuery ?? "1",
        items: (4).toString(),
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
    getPreviousPageParam: (firstPage) => {
      const { page } = firstPage;
      if (page <= 1) return undefined;
      return page - 1;
    },
    getNextPageParam: (lastPage) => {
      const { page, numPages } = lastPage;
      if (page >= numPages) return undefined;
      return page + 1;
    },
  });

  const items = itemsQuery.data?.pages.map((page) => page.results).flat() ?? [];
  const minPage = itemsQuery.data?.pages?.[0]?.page ?? 1;
  const maxPage = itemsQuery.data?.pages?.at(-1)?.page ?? 1;

  return (
    <main class={style.main}>
      <h1 class={style.header}>Replugged {LABELS[kind]}</h1>
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
        <StoreBody
          {...itemsQuery}
          items={items}
          minPage={minPage}
          maxPage={maxPage}
          query={query}
        />
      </div>
    </main>
  );
}
