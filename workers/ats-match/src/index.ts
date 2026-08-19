import {
  atsMatchRequestSchema,
  type AtsMatchError,
} from "../../../lib/cv/ats-match";
import { verifyTurnstile } from "./turnstile";
import { callAiProvider, type Env as AiEnv } from "./ai-provider";

interface RateLimiter {
  limit: (opts: { key: string }) => Promise<{ success: boolean }>;
}

interface Env extends AiEnv {
  RATE_LIMITER: RateLimiter;
  TURNSTILE_SECRET_KEY?: string;
}

// TODO: lock this down to the real site origin once the frontend is wired up.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function errorResponse(code: AtsMatchError["code"], message: string, status: number): Response {
  const body: AtsMatchError = { error: message, code };
  return jsonResponse(body, status);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

    // 1. Rate limit first — cheapest check, no external call, no cost.
    const { success: withinLimit } = await env.RATE_LIMITER.limit({ key: ip });
    if (!withinLimit) {
      return errorResponse("rate_limited", "Too many requests. Try again in a minute.", 429);
    }

    // 2. Parse + validate the payload shape (needed before Turnstile, since
    //    the token lives inside the body).
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return errorResponse("invalid_input", "Request body must be valid JSON.", 400);
    }
    const parsed = atsMatchRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResponse("invalid_input", "Request payload failed validation.", 400);
    }
    const { jobDescription, cv, turnstileToken } = parsed.data;

    // 3. Verify the human check.
    const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!isHuman) {
      return errorResponse("invalid_input", "Verification failed.", 403);
    }

    // 4. Only now — after every free check has passed — call the (currently
    //    mocked) AI provider.
    try {
      const result = await callAiProvider(jobDescription, cv, env);
      return jsonResponse(result, 200);
    } catch (err) {
      console.error("AI provider call failed:", err);
      return errorResponse("upstream_error", "Failed to generate a match score. Try again.", 502);
    }
  },
};

export default worker;
