import type { Metadata } from "next";
import { FileCheck, Type, Upload } from "lucide-react";
import { PdfEditor } from "@/components/PdfEditor";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("editar-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };
export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>Editar PDF</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><ToolIcon tool={tool} /><div><h1>Editar PDF online</h1><p>Adicione texto ou comentario em uma pagina do PDF e baixe o arquivo editado.</p></div></header>
        <PdfEditor />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
    <section className="tool-content">
      <div>
        <h2>Como editar PDF</h2>
        <div className="mini-steps">
          <span><Upload /> Envie seu PDF</span>
          <span><Type /> Digite o texto</span>
          <span><FileCheck /> Baixe o PDF editado</span>
        </div>
      </div>
      <div>
        <h2>Quando usar</h2>
        <ul>
          <li>Adicionar observacoes rapidas em um documento.</li>
          <li>Marcar um PDF como revisado, aprovado ou recebido.</li>
          <li>Inserir um comentario simples antes de compartilhar.</li>
          <li>Gerar uma copia editada sem instalar programas.</li>
        </ul>
      </div>
    </section>
  </article>;
}
