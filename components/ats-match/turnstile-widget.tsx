"use client";

import { useEffect, useRef, useState } from "react";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/language-context";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
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
export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) {
      onToken("dev-bypass");
      return;
    }

    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY!,
        callback: (token) => {
          setWidgetError(false);
          onToken(token);
        },
        "error-callback": () => {
          setWidgetError(true);
          onToken(null);
        },
        "expired-callback": () => {
          // Not a failure — the widget shows its own "expired" UI and lets
          // the visitor re-verify. Just clear the now-stale token so submit
          // disables again until a fresh one arrives.
          onToken(null);
        },
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
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function retry() {
    setWidgetError(false);
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }

  if (!SITE_KEY) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground">
        <InfoIcon className="size-3.5 shrink-0" aria-hidden />
        <span>{t.atsMatch.turnstileDevNotice}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} data-loaded={loaded} />
      {widgetError && (
        <div className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden />
          <span>{t.atsMatch.turnstileWidgetError}</span>
          <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={retry}>
            {t.atsMatch.turnstileRetry}
          </Button>
        </div>
      )}
    </div>
  );
}
