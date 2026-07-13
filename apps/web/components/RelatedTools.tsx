import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { tools } from "@/lib/tools";
import { ToolIcon } from "./ToolIcon";

export function RelatedTools({ activeSlug }: { activeSlug: string }) {
  return <aside className="related-tools" aria-label="Outras ferramentas">
    <h2>Outras ferramentas</h2>
    <div>
      {tools.map((tool) => <Link href={tool.href} key={tool.slug} className={tool.slug === activeSlug ? "active" : ""}>
        <ToolIcon tool={tool} compact />
        <span>{tool.shortTitle}</span>
        <ChevronRight size={18} />
      </Link>)}
    </div>
  </aside>;
}
