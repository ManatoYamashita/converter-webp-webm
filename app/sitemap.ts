import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://2ewbp.manapuraza.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [""].map((path) => ({
    url: `${siteUrl}/${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  return routes;
}
