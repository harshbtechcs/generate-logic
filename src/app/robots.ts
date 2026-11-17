import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Served at /robots.txt — tells search engines what to crawl.
// Personal and admin pages stay out of search results.
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
