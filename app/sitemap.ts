import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://cvforge.pichchanthorn.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/editor", "/legal/privacy", "/legal/terms"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
