import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.PUBLIC_ORIGIN ?? "http://localhost:8090";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/baixar/", "/api/"] }], sitemap: `${base}/sitemap.xml` };
}
