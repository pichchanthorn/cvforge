import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The enforced authorization boundary (see plan §8). Proxy only performs an
 * optimistic redirect; every protected page, Route Handler, and Server
 * Action must call one of these instead of trusting Proxy already ran.
 * cache() dedupes repeated calls within a single render/request.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
