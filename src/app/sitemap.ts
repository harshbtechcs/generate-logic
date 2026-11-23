import type { MetadataRoute } from "next";
import { technologies } from "@/lib/data";
import { site } from "@/lib/site";
import { getQuizTools } from "@/lib/quiz/tools";

// Served at /sitemap.xml — the list of public pages Google should index.
// Rebuilt at most once an hour so new YouTube playlists get added automatically.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/playlists`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/notes`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const learn: MetadataRoute.Sitemap = technologies.map((t) => ({
    url: `${base}/learn/${t.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Individual playlist pages need sign-in, so they are not listed for search engines.
  const quizzes: MetadataRoute.Sitemap = getQuizTools().map((t) => ({
    url: `${base}/quiz/${t.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...pages, { url: `${base}/quiz`, changeFrequency: "weekly" as const, priority: 0.8 }, ...learn, ...quizzes];
}
