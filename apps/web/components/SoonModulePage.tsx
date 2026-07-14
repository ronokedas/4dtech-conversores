import { ComingSoonTool } from "./ComingSoonTool";
import { RelatedTools } from "./RelatedTools";
import { ToolIcon } from "./ToolIcon";
import type { ToolDefinition } from "@/lib/tools";

export function SoonModulePage({ tool }: { tool: ToolDefinition }) {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>{tool.title}</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><ToolIcon tool={tool} /><div><h1>{tool.title} online</h1><p>{tool.longDescription}</p></div></header>
        <ComingSoonTool title={tool.title} />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
    <section className="tool-content">
      <div><h2>Sobre esta ferramenta</h2><p>{tool.longDescription} A página já está preparada para receber o módulo completo assim que ele for ativado.</p></div>
      <div><h2>Enquanto isso</h2><p>Você pode usar as ferramentas disponíveis no menu lateral, como HTML para PDF e Remover fundo de imagem.</p></div>
    </section>
  </article>;
}
