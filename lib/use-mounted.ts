import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True only after the client has hydrated — avoids SSR/client mismatches. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
