/**
 * Real Cloudflare Turnstile server-side verification — not mocked.
 *
 * Dev-mode fallback: if TURNSTILE_SECRET_KEY isn't configured (e.g. no
 * `wrangler secret put` has been run yet, or no `.dev.vars` locally), this
 * skips verification and logs a warning instead of failing every request.
 * That's the only "demo mode" behavior here; once a real secret is set,
 * this always calls the real siteverify endpoint and fails closed (treats
 * any error — bad token, network failure, malformed response — as
 * "not verified") rather than letting an ambiguous result through.
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string | undefined,
  remoteIp: string,
): Promise<boolean> {
  if (!secretKey) {
    console.warn(
      "TURNSTILE_SECRET_KEY not configured — skipping Turnstile verification. " +
        "This must not happen in production; set the secret via `wrangler secret put`.",
    );
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: remoteIp,
        }),
      },
    );
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return false; // fail closed
  }
}
