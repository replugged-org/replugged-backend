import type { Attributes, VNode } from "preact";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import Hamburger from "../util/Hamburger";
import style from "./layout.module.css";

type LayoutWithSidebarProps = Attributes & {
  sidebarClassName?: string;
  contentsClassName?: string;
  children: [PreactNode, PreactNode];
};

type PreactNode = VNode & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __k?: PreactNode[];
  props: {
    children: string | null;
  };
};

export interface Document {
  id: string;
  title: string;
  parts: string[];
}
export interface Category {
  id: string;
  name: string;
  docs: Document[];
}

function digTitle(preactNode: PreactNode): string | null {
  if (preactNode.type === "h1") {
    return preactNode.props.children;
  }

  if (preactNode.__k) {
    for (const node of preactNode.__k) {
      if (!node) {
        continue;
      }
      const res = digTitle(node);
      if (res) {
        return res;
      }
    }
  }

  return null;
}

export default function LayoutWithSidebar({
  sidebarClassName,
  contentsClassName,
  children: [sidebar, content],
}: LayoutWithSidebarProps): VNode {
  const [opened, setOpened] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    let to: number | undefined = void 0;
    let i = 0;
    function fn(): void {
      if (i > 10) {
        return setTitle("");
      }
      i++;

      if (!(content as PreactNode)?.__k) {
        return void (to = window.setTimeout(fn, 10));
      }
      const res = digTitle(content);

      if (!res) {
        return void (to = window.setTimeout(fn, 10));
      }
      setTitle(res);
    }

    to = window.setTimeout(fn, 10);
    return () => clearTimeout(to);
  }, [content]);

  return (
    <div className={style.container}>
      <div
        className={[style.sidebar, opened && style.opened, sidebarClassName]
          .filter(Boolean)
          .join(" ")}>
        <div className={style.title}>
          <Hamburger opened={opened} setOpened={setOpened} className={style.b} />
          {title && <span>{title}</span>}
        </div>
        <div className={style.inner}>{sidebar}</div>
      </div>
      <div className={`${style.contents}${contentsClassName ? ` ${contentsClassName}` : ""}`}>
        {content}
      </div>
    </div>
  );
}
