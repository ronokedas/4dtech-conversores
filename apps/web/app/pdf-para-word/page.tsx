import type { Metadata } from "next";
import { FileCheck, PencilLine, Upload } from "lucide-react";
import { PdfToWordConverter } from "@/components/PdfToWordConverter";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("pdf-para-word")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };
export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>PDF para Word</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><ToolIcon tool={tool} /><div><h1>PDF para Word online</h1><p>Converta PDF em documento Word DOCX para editar textos e ajustar o arquivo depois.</p></div></header>
        <PdfToWordConverter />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
    <section className="tool-content">
      <div>
        <h2>Como converter PDF para Word</h2>
        <div className="mini-steps">
          <span><Upload /> Envie seu PDF</span>
          <span><FileCheck /> Aguarde a conversao</span>
          <span><PencilLine /> Baixe o DOCX</span>
        </div>
      </div>
      <div>
        <h2>Quando usar</h2>
        <ul>
          <li>Recuperar texto de documentos PDF editaveis.</li>
          <li>Transformar propostas e relatorios em DOCX.</li>
          <li>Fazer ajustes em arquivos recebidos em PDF.</li>
          <li>Converter PDFs simples sem instalar programas.</li>
        </ul>
      </div>
    </section>
  </article>;
}
