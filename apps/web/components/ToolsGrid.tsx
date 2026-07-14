import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { tools } from "@/lib/tools";
import { ToolIcon } from "./ToolIcon";

export function ToolsGrid({ title = "Escolha uma ferramenta", intro }: { title?: string; intro?: string }) {
  return <section className="tools-section" id="ferramentas">
    <div className="section-heading">
      <h2>{title}</h2>
      {intro ? <p>{intro}</p> : null}
    </div>
    <div className="tools-grid">
      {tools.map((tool) => <Link href={tool.href} key={tool.slug} className={`tool-card ${tool.status === "available" ? "available" : "soon"}`}>
        <ToolIcon tool={tool} />
        <h3>{tool.title}</h3>
        <p>{tool.description}</p>
        <span className={`status-chip ${tool.status}`}>
          {tool.status === "available" ? <CheckCircle2 /> : <Clock />}
          {tool.status === "available" ? "Disponível" : "Em breve"}
        </span>
        <span className={tool.status === "available" ? "tool-action primary" : "tool-action"}>
          {tool.status === "available" ? "Usar ferramenta" : "Saiba mais"} <ArrowRight />
        </span>
      </Link>)}
    </div>
  </section>;
}
