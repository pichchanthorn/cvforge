import type { AtsMatchCv, AtsMatchResponse } from "../../../lib/cv/ats-match";

/**
 * ⚠️ MOCK MATCHING LOGIC — not real AI. ⚠️
 *
 * Simulates a plausible match result via simple case-insensitive substring
 * overlap between job-description keywords and the CV text, plus a small
 * random jitter on the score so repeated identical requests don't look
 * suspiciously static. This exists only so the Worker and frontend can be
 * built and tested end-to-end for free before AI credits are purchased.
 * Delete this file (and mock-match usage in ai-provider.ts) once the real
 * Anthropic call replaces it.
 */

const STOPWORDS = new Set([
  "the", "and", "for", "are", "with", "you", "your", "our", "will", "have",
  "has", "this", "that", "from", "who", "must", "able", "all", "can", "not",
  "but", "any", "job", "role", "team", "work", "using", "years", "year",
  "experience", "required", "preferred", "strong", "skills", "including",
  "looking", "plus", "along", "familiarity", "into", "than", "such", "also",
  "some", "each", "other", "were", "been", "well", "high", "self",
]);

function extractKeywords(jobDescription: string): string[] {
  const words = jobDescription
    .toLowerCase()
    // Keep letters/digits and a few tech-relevant symbols (C++, C#, Node.js).
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim().replace(/^[.\-]+|[.\-]+$/g, "")) // strip stray leading/trailing punctuation
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return Array.from(new Set(words)).slice(0, 20);
}

function buildCvText(cv: AtsMatchCv): string {
  return [
    cv.headline,
    cv.summary,
    ...cv.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...cv.education.flatMap((e) => [e.degree, e.fieldOfStudy]),
    ...cv.skills.flatMap((s) => [s.name, s.groupName]),
    ...cv.projects.flatMap((p) => [p.name, p.description, ...p.tech]),
    ...cv.languages.map((l) => l.name),
  ]
    .join(" ")
    .toLowerCase();
}

export function mockMatch(
  jobDescription: string,
  cv: AtsMatchCv,
): AtsMatchResponse {
  const keywords = extractKeywords(jobDescription);
  const cvText = buildCvText(cv);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  for (const keyword of keywords) {
    if (cvText.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const ratio = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;
  const jitter = Math.floor(Math.random() * 11) - 5; // -5..+5, keeps it feeling "alive"
  const score = Math.max(0, Math.min(100, Math.round(ratio * 100) + jitter));

  const suggestions = missingKeywords
    .slice(0, 3)
    .map((keyword) => `Consider highlighting experience with "${keyword}" if it applies to you.`);
  if (suggestions.length === 0) {
    suggestions.push("Great overlap — your CV already covers the key terms in this job description.");
  }

  return { score, matchedKeywords, missingKeywords, suggestions };
}
