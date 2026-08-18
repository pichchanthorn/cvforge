import {
  type AtsMatchCv,
  type AtsMatchResponse,
  type AtsMatchError,
} from "@/lib/cv/ats-match";

const API_URL = process.env.NEXT_PUBLIC_ATS_MATCH_API_URL ?? "http://localhost:8787";

export type AtsMatchResult =
  | { ok: true; data: AtsMatchResponse }
  | { ok: false; error: AtsMatchError };

/** Calls the ATS Match worker. Never throws — errors come back as { ok: false }. */
export async function fetchAtsMatch(
  jobDescription: string,
  cv: AtsMatchCv,
  turnstileToken: string,
): Promise<AtsMatchResult> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription, cv, turnstileToken }),
    });

    const body = await response.json();
    if (!response.ok) {
      return { ok: false, error: body as AtsMatchError };
    }
    return { ok: true, data: body as AtsMatchResponse };
  } catch {
    return {
      ok: false,
      error: { error: "Could not reach the match service.", code: "upstream_error" },
    };
  }
}
