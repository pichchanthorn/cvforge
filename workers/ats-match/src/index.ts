/**
 * ATS Match worker — Step 1 skeleton.
 *
 * Returns a hardcoded response matching the AtsMatchResponse contract.
 * No AI call, no rate-limiting, no Turnstile yet — those land in later steps.
 */

interface AtsMatchResponse {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

// TODO: lock this down to the real site origin once the frontend is wired up (step 6).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const HARDCODED_RESPONSE: AtsMatchResponse = {
  score: 72,
  matchedKeywords: ["TypeScript", "React", "REST API"],
  missingKeywords: ["Kubernetes", "GraphQL"],
  suggestions: [
    "This is a placeholder response from the Worker skeleton — no AI call has been made yet.",
  ],
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify(HARDCODED_RESPONSE), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  },
};
