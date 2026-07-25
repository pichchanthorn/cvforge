import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged client using the secret key (bypasses RLS). Restricted to
 * operations that genuinely require it — e.g. `auth.admin.deleteUser` for
 * account deletion (plan §8). Never use this for ordinary data access; use
 * lib/supabase/server.ts so RLS stays the enforced boundary.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
