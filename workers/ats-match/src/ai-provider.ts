import type { AtsMatchCv, AtsMatchResponse } from "../../../lib/cv/ats-match";
import { mockMatch } from "./mock-match";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- placeholder, extended once AI_API_KEY is added
export interface Env {
  // TODO(real-ai): add AI_API_KEY here (via `wrangler secret put`) when
  // swapping the mock body below for a real Anthropic call.
}

/**
 * The single swap point for going from demo mode to a real AI call.
 *
 * ⚠️ Currently MOCKED — see mock-match.ts. ⚠️
 *
 * The signature is intentionally the real one: (jobDescription, cv, env) ->
 * Promise<AtsMatchResponse>. Swapping to a real Anthropic call later should
 * only mean replacing this function's body with a `fetch()` call to the
 * Anthropic API (using env.AI_API_KEY) that parses the model's response
 * into the same AtsMatchResponse shape — nothing in index.ts, turnstile.ts,
 * or the rate-limit logic needs to change.
 */
export async function callAiProvider(
  jobDescription: string,
  cv: AtsMatchCv,
  env: Env,
): Promise<AtsMatchResponse> {
  void env; // unused until the real implementation reads env.AI_API_KEY
  return mockMatch(jobDescription, cv);
}
