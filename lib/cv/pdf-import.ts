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
