import { newId, type CvData } from "@/lib/cv/schema";

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items
      .filter((item): item is typeof item & { str: string; transform: number[] } =>
        "str" in item && "transform" in item && typeof item.str === "string" && Array.isArray(item.transform),
      )
      .map((item) => ({ text: item.str.trim(), x: item.transform[4], y: item.transform[5] }))
      .filter((item) => item.text);
    const lineGroups: { y: number; items: typeof items }[] = [];

    for (const item of items) {
      const line = lineGroups.find((candidate) => Math.abs(candidate.y - item.y) < 3);
      if (line) line.items.push(item);
      else lineGroups.push({ y: item.y, items: [item] });
    }

    const text = lineGroups
      .sort((first, second) => second.y - first.y)
      .map((line) => line.items.sort((first, second) => first.x - second.x).map((item) => item.text).join(" "))
      .join("\n")
      .trim();
    if (text) pages.push(text);
  }

  return pages.join("\n\n");
}

function cleanUrl(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/[),.;]+$/g, "");
}

export function parsePdfPersonalInfo(text: string): Pick<CvData["personalInfo"], "fullName" | "headline" | "email" | "phone" | "location" | "links"> {
  const lines = text.split(/\n|(?<=\.) (?=[A-Z][a-z]+:)/).map((line) => line.trim()).filter(Boolean);
  const email = text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/)?.[0] ?? "";
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0].replace(/[()\s-]/g, "") ?? "";
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,)]+/i)?.[0];
  const portfolio = text.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s,)]*)?/i)?.[0];
  const links = [
    linkedin && { id: newId(), label: "LinkedIn", url: cleanUrl(linkedin) },
    portfolio && !/linkedin/i.test(portfolio) && { id: newId(), label: "Portfolio", url: cleanUrl(portfolio) },
  ].filter((link): link is { id: string; label: string; url: string } => Boolean(link));

  const contactIndex = lines.findIndex((line) => /^contact$/i.test(line));
  const location = contactIndex >= 0
    ? lines.slice(contactIndex + 1, contactIndex + 4).find((line) => /[a-z]+\s*,\s*[a-z]+/i.test(line)) ?? ""
    : "";
  const certificationsIndex = lines.findIndex((line) => /^certifications?$/i.test(line));
  const experienceIndex = lines.findIndex((line) => /^experience$/i.test(line));
  const identityLines = lines.slice(
    certificationsIndex >= 0 ? certificationsIndex + 1 : 0,
    experienceIndex > certificationsIndex ? experienceIndex : lines.length,
  );
  const nameIndex = identityLines.findIndex(
    (line) =>
      line.length >= 3 &&
      !line.includes(",") &&
      !line.includes("@") &&
      !/^(experience|education|skills|contact|certifications|page \d+)/i.test(line),
  );
  const name = nameIndex >= 0 ? identityLines[nameIndex] : "";
  const possibleHeadline = nameIndex >= 0 ? identityLines[nameIndex + 1] ?? "" : "";
  const headline = possibleHeadline.includes(",") || /^page \d+/i.test(possibleHeadline) ? "" : possibleHeadline;

  return {
    fullName: name,
    headline: /^(experience|education|skills|contact|certifications)$/i.test(headline) ? "" : headline,
    email,
    phone,
    location,
    links,
  };
}

// --- Section-based parsing for experience/education/skills/certifications ---
//
// Resume layouts vary a lot, so this is a best-effort heuristic, not a full
// parser: it extracts what it can from common patterns (ALL-CAPS or
// Title Case section headers, "•"-style bullets, "Month YYYY – Month YYYY"
// / "YYYY – Present" date ranges) and leaves the rest for the user to fix
// in the form afterward — the whole point of the review-before-import flow.

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const SECTION_STARTS = {
  experience: /^(?:work\s+|professional\s+)?experience$/i,
  education: /^education$/i,
  skills: /^(?:technical\s+|core\s+|key\s+)?skills$/i,
  certifications: /^certifications?(?:\s*(?:&|and)\s*(?:training|licenses?))?$/i,
} as const;

// Broader than SECTION_STARTS — used only to find where a section *ends*,
// so e.g. a "Skills" section doesn't swallow a following "Projects" section
// just because parsePdfSkills doesn't know how to extract projects.
const ANY_SECTION_HEADER = new RegExp(
  `^(?:contact|summary|profile|objective|projects?|languages?|awards?|references?|${Object.values(SECTION_STARTS)
    .map((re) => re.source.replace(/^\^|\$$/g, ""))
    .join("|")})$`,
  "i",
);

/** Lines between a matched section header and the next header of any kind. */
function sectionSlice(lines: string[], key: keyof typeof SECTION_STARTS): string[] {
  const startIndex = lines.findIndex((line) => SECTION_STARTS[key].test(line));
  if (startIndex === -1) return [];
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (ANY_SECTION_HEADER.test(lines[i])) {
      endIndex = i;
      break;
    }
  }
  return lines.slice(startIndex + 1, endIndex);
}

const BULLET_RE = /^[•●▪◦‣∙*-]\s*/;
function isBulletLine(line: string): boolean {
  return BULLET_RE.test(line);
}
function stripBullet(line: string): string {
  return line.replace(BULLET_RE, "").trim();
}

// Recognizing location text is genuinely hard without a gazetteer — "Title,
// City" and "Institution, City" both look identical to a plain comma split.
// Anchoring on a real US state code (rather than "any two comma-separated
// words") is deliberately conservative: it correctly pulls "San Francisco,
// CA" out of "Senior Engineer, San Francisco, CA" without also misfiring on
// "University of California, Berkeley" or "Software Engineer, Remote".
// International addresses and cities without a trailing state code are a
// known gap — they'll stay stuck in the company/role or institution/degree
// text instead, for the user to move manually.
const US_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
  "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
  "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
  "WI", "WY", "DC",
]);

const MONTHS: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", sept: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
};

/** "January 2020" / "Jan 2020" / "01/2020" / "2020" -> "2020-01" / "2020". */
function parseDateToken(token: string): string {
  const t = token.trim();
  const monthYear = t.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTHS[monthYear[1].toLowerCase()];
    if (month) return `${monthYear[2]}-${month}`;
  }
  const numeric = t.match(/^(\d{1,2})[/-](\d{4})$/);
  if (numeric) return `${numeric[2]}-${numeric[1].padStart(2, "0")}`;
  const yearOnly = t.match(/^(\d{4})$/);
  if (yearOnly) return yearOnly[1];
  return "";
}

const DATE_TOKEN = "(?:[A-Za-z]+\\.?\\s+\\d{4}|\\d{1,2}/\\d{4}|\\d{4})";
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:[-–—]|to)\\s*(${DATE_TOKEN}|present|current|ongoing|now)`,
  "i",
);

/** Finds a date range anywhere in a line and returns it plus the rest of the line. */
function extractDateRange(
  line: string,
): { startDate: string; endDate: string; isCurrent: boolean; remainder: string } | null {
  const match = line.match(DATE_RANGE_RE);
  if (!match || match.index === undefined) return null;
  const startDate = parseDateToken(match[1]);
  const isCurrent = /present|current|ongoing|now/i.test(match[2]);
  const endDate = isCurrent ? "" : parseDateToken(match[2]);
  const remainder = (line.slice(0, match.index) + line.slice(match.index + match[0].length))
    .replace(/^[|,\-–—•\s]+|[|,\-–—•\s]+$/g, "")
    .trim();
  return { startDate, endDate, isCurrent, remainder };
}

/**
 * Splits header lines into { location, rest }. Checks each line for either
 * a standalone "City, ST" (the whole line pulled out as location) or a
 * trailing ", City, ST" (stripped off the end, keeping the text before it,
 * e.g. "Senior Engineer, San Francisco, CA" -> "Senior Engineer" + location).
 * Stops at the first match — at most one location per entry.
 */
function extractLocation(headerLines: string[]): { location: string; rest: string[] } {
  const rest: string[] = [];
  let location = "";

  for (const line of headerLines) {
    if (!location) {
      const standalone = line.match(/^([A-Za-z][A-Za-z .'-]*),\s*([A-Z]{2})$/);
      if (standalone && US_STATE_CODES.has(standalone[2])) {
        location = line;
        continue;
      }
      const trailing = line.match(/^(.*?),\s*([A-Za-z][A-Za-z .'-]*),\s*([A-Z]{2})$/);
      if (trailing && US_STATE_CODES.has(trailing[3])) {
        location = `${trailing[2].trim()}, ${trailing[3]}`;
        if (trailing[1].trim()) rest.push(trailing[1].trim());
        continue;
      }
    }
    rest.push(line);
  }

  return { location, rest };
}

// Company-vs-role ordering isn't consistent across resumes — some list
// "Company \n Title", others "Title \n Company". When there are exactly two
// candidate lines, prefer whichever one reads like a job title over a fixed
// line-order assumption; this is a cheap, common-case signal, not a
// guarantee (a two-line company name plus a single-word title will still
// get the fallback order).
const ROLE_KEYWORDS =
  /\b(engineer|manager|designer|director|analyst|developer|specialist|coordinator|lead|consultant|architect|scientist|officer|executive|assistant|associate|intern|founder|president|ceo|cto|cfo|coo|vp|representative|technician|administrator|supervisor)\b/i;

function orderCompanyAndRole(a: string, b: string): [company: string, role: string] {
  const aIsRole = ROLE_KEYWORDS.test(a);
  const bIsRole = ROLE_KEYWORDS.test(b);
  if (aIsRole && !bIsRole) return [b, a];
  return [a, b]; // ambiguous (both/neither match) -> fall back to company-first
}

export function parsePdfExperience(text: string): CvData["experience"] {
  const sectionLines = sectionSlice(splitLines(text), "experience");
  if (sectionLines.length === 0) return [];

  const entries: CvData["experience"] = [];
  let pending: string[] = [];
  let current: CvData["experience"][number] | null = null;

  function flush() {
    if (current && (current.company || current.role)) entries.push(current);
    current = null;
  }

  for (const rawLine of sectionLines) {
    if (isBulletLine(rawLine)) {
      const bulletText = stripBullet(rawLine);
      if (current && bulletText) current.bullets.push(bulletText.slice(0, 300));
      continue;
    }

    const dateInfo = extractDateRange(rawLine);
    if (!dateInfo) {
      pending.push(rawLine);
      if (pending.length > 3) pending.shift();
      continue;
    }

    flush();
    const headerLines = dateInfo.remainder ? [...pending, dateInfo.remainder] : [...pending];
    const { location, rest } = extractLocation(headerLines);
    const [company, role] =
      rest.length >= 2 ? orderCompanyAndRole(rest[0], rest[1]) : [rest[0] ?? "", rest[1] ?? ""];
    current = {
      id: newId(),
      company,
      role,
      location,
      startDate: dateInfo.startDate,
      endDate: dateInfo.endDate,
      isCurrent: dateInfo.isCurrent,
      bullets: [],
    };
    pending = [];
  }
  flush();

  return entries.slice(0, 15); // matches experienceItemSchema array max
}

/** "Bachelor of Science in Computer Science" -> degree + fieldOfStudy. */
function splitDegree(text: string): { degree: string; fieldOfStudy: string } {
  const match = text.match(/^(.*?)\s+in\s+(.+)$/i);
  return match ? { degree: match[1].trim(), fieldOfStudy: match[2].trim() } : { degree: text, fieldOfStudy: "" };
}

// Same ambiguity as company-vs-role, but for institution-vs-degree lines
// ("University of X \n BA in Y" vs. "BA in Y \n University of X").
const DEGREE_KEYWORDS =
  /\b(bachelor|master|associate|diploma|certificate|ph\.?d|b\.?a\.?|b\.?s\.?|b\.?eng\.?|m\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|m\.?eng\.?)\b/i;

function orderInstitutionAndDegree(a: string, b: string): [institution: string, degree: string] {
  const aIsDegree = DEGREE_KEYWORDS.test(a);
  const bIsDegree = DEGREE_KEYWORDS.test(b);
  if (aIsDegree && !bIsDegree) return [b, a];
  return [a, b]; // ambiguous (both/neither match) -> fall back to institution-first
}

export function parsePdfEducation(text: string): CvData["education"] {
  const sectionLines = sectionSlice(splitLines(text), "education");
  if (sectionLines.length === 0) return [];

  const entries: CvData["education"] = [];
  let pending: string[] = [];
  let current: CvData["education"][number] | null = null;
  let descriptionLines: string[] = [];

  function flush() {
    if (current && (current.institution || current.degree)) {
      current.description = descriptionLines.join(" ").slice(0, 500);
      entries.push(current);
    }
    current = null;
    descriptionLines = [];
  }

  for (const rawLine of sectionLines) {
    if (isBulletLine(rawLine)) {
      const bulletText = stripBullet(rawLine);
      if (current && bulletText) descriptionLines.push(bulletText);
      continue;
    }

    const dateInfo = extractDateRange(rawLine);
    if (!dateInfo) {
      pending.push(rawLine);
      if (pending.length > 3) pending.shift();
      continue;
    }

    flush();
    const headerLines = dateInfo.remainder ? [...pending, dateInfo.remainder] : [...pending];
    const { location, rest } = extractLocation(headerLines);
    const [institution, degreeText] =
      rest.length >= 2 ? orderInstitutionAndDegree(rest[0], rest[1]) : [rest[0] ?? "", rest[1] ?? ""];
    const { degree, fieldOfStudy } = splitDegree(degreeText);
    current = {
      id: newId(),
      institution,
      degree,
      fieldOfStudy,
      location,
      startDate: dateInfo.startDate,
      endDate: dateInfo.endDate,
      isCurrent: dateInfo.isCurrent,
      description: "",
    };
    pending = [];
  }
  flush();

  return entries.slice(0, 10); // matches educationItemSchema array max
}

export function parsePdfSkills(text: string): CvData["skills"] {
  const sectionLines = sectionSlice(splitLines(text), "skills");
  const skills: CvData["skills"] = [];
  const seen = new Set<string>();

  function addSkill(rawName: string, groupName: string) {
    const name = rawName.trim().replace(/[.;]+$/, "").trim();
    if (!name || name.length > 60) return;
    const key = `${groupName.toLowerCase()}::${name.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    skills.push({ id: newId(), name, groupName: groupName.slice(0, 60) });
  }

  for (const rawLine of sectionLines) {
    const line = stripBullet(rawLine);
    if (!line) continue;
    // "Languages: JavaScript, TypeScript, Python" -> group + comma list.
    const labeled = line.match(/^([A-Za-z][A-Za-z /&-]{1,30}):\s*(.+)$/);
    if (labeled) {
      for (const item of labeled[2].split(/[,;]/)) addSkill(item, labeled[1].trim());
    } else if (/[,;]/.test(line)) {
      for (const item of line.split(/[,;]/)) addSkill(item, "");
    } else {
      addSkill(line, "");
    }
  }

  return skills.slice(0, 40); // matches skillItemSchema array max
}

export function parsePdfCertifications(text: string): CvData["certifications"] {
  const sectionLines = sectionSlice(splitLines(text), "certifications");
  const certifications: CvData["certifications"] = [];

  for (const rawLine of sectionLines) {
    const line = stripBullet(rawLine);
    if (!line) continue;

    const urlMatch = line.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s,)]*)?/i);
    const credentialUrl = urlMatch ? cleanUrl(urlMatch[0]) : "";
    let remainder = urlMatch ? line.replace(urlMatch[0], "") : line;

    const yearMatch = remainder.match(/\b(19|20)\d{2}\b/);
    const issueDate = yearMatch ? yearMatch[0] : "";
    if (yearMatch) remainder = remainder.replace(yearMatch[0], "");

    remainder = remainder.replace(/[()]/g, "").replace(/^[,\-–—\s]+|[,\-–—\s]+$/g, "").trim();
    const parts = remainder.split(/\s*[–—-]\s*|,\s*/).map((part) => part.trim()).filter(Boolean);
    const [name, issuer] = parts;
    if (!name) continue;

    certifications.push({ id: newId(), name, issuer: issuer ?? "", issueDate, credentialUrl });
  }

  return certifications.slice(0, 10); // matches certificationItemSchema array max
}
