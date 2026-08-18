"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/language-context";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Renders the real Cloudflare Turnstile widget when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set. Otherwise — dev-mode fallback, matching the worker's own
 * TURNSTILE_SECRET_KEY bypass — renders a small notice and immediately
 * hands back a placeholder token, so the rest of the flow can be built and
 * tested without a Cloudflare account.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) {
      onToken("dev-bypass");
      return;
    }

    let widgetId: string | undefined;
    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY!,
        callback: onToken,
      });
      setLoaded(true);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (window.turnstile) {
      render();
    } else if (existing) {
      existing.addEventListener("load", render);
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", render);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) {
    return <p className="text-xs text-muted-foreground">{t.atsMatch.turnstileDevNotice}</p>;
  }

  return <div ref={containerRef} data-loaded={loaded} />;
}
