import { VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Toaster as ToasterLib } from "react-hot-toast";

export default function Toaster(): VNode {
  const appEl = document.getElementById("app");
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (appEl) {
      const onScroll = (): void => setScrollTop(appEl.scrollTop);
      appEl.addEventListener("scroll", onScroll);
      return () => appEl.removeEventListener("scroll", onScroll);
    }
  }, [appEl]);

  return (
    <ToasterLib
      reverseOrder={true}
      containerStyle={{
        marginTop: Math.max(0, 72 - scrollTop),
      }}
    />
  );
}
