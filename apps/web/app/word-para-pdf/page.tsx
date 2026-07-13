import type { Metadata } from "next";
import { FileCheck, ShieldCheck, Upload } from "lucide-react";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolIcon } from "@/components/ToolIcon";
import { WordToPdfConverter } from "@/components/WordToPdfConverter";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("word-para-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };
export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>Word para PDF</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><ToolIcon tool={tool} /><div><h1>Word para PDF online</h1><p>Converta arquivos DOC e DOCX em PDF mantendo o visual do documento original.</p></div></header>
        <WordToPdfConverter />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
    <section className="tool-content">
      <div>
        <h2>Como converter Word para PDF</h2>
        <div className="mini-steps">
          <span><Upload /> Envie seu DOC ou DOCX</span>
          <span><FileCheck /> Aguarde a conversao</span>
          <span><ShieldCheck /> Baixe o PDF pronto</span>
        </div>
      </div>
      <div>
        <h2>Quando usar</h2>
        <ul>
          <li>Enviar documentos sem perder a formatacao.</li>
          <li>Compartilhar contratos, propostas e relatorios.</li>
          <li>Salvar curriculos, cartas e trabalhos em PDF.</li>
          <li>Evitar edicoes acidentais no arquivo final.</li>
        </ul>
      </div>
    </section>
  </article>;
}
