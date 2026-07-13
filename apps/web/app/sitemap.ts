import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.PUBLIC_ORIGIN ?? "http://localhost:8090";
  const paths = ["", "/ferramentas", ...tools.map((tool) => tool.href), "/como-funciona", "/duvidas", "/privacidade", "/termos", "/guias/html-para-pdf", "/guias/converter-url-em-pdf", "/guias/preservar-css-imagens-e-fontes", "/guias/corrigir-erros-na-conversao"];
  return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path ? "monthly" : "weekly", priority: path ? 0.7 : 1 }));
}
