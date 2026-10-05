"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    show_11962391?: (options?: {
      type?: "inApp";
      inAppSettings?: {
        frequency?: number;
        capping?: number;
        interval?: number;
        timeout?: number;
        everyPage?: boolean;
      };
    }) => Promise<unknown>;
  }
}

export default function MonetagAds() {
  const [ready, setReady] = useState(false);
  const [watching, setWatching] = useState(false);
  const startedInApp = useRef(false);

  useEffect(() => {
    if (!ready || startedInApp.current || !window.show_11962391) return;
    startedInApp.current = true;
    window.show_11962391({
      type: "inApp",
      inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false },
    }).catch(() => {});
  }, [ready]);

  async function showRewarded() {
    if (!window.show_11962391 || watching) return false;
    setWatching(true);
    try { await window.show_11962391(); return true; }
    catch { return false; }
    finally { setWatching(false); }
  }

  return <>
    <Script src="//libtl.com/sdk.js" data-zone="11962391" data-sdk="show_11962391" strategy="afterInteractive" onLoad={() => setReady(true)} />
    <button type="button" data-monetag-rewarded disabled={!ready || watching} onClick={async () => {
      const watched = await showRewarded();
      window.dispatchEvent(new CustomEvent("monetag-reward", { detail: { watched } }));
    }} style={{display:"none"}}>
      {watching ? "Watching ad…" : "Watch ad"}
    </button>
  </>;
}
