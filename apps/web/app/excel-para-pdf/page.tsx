import type { Metadata } from "next";
import { FileCheck, Maximize2, Upload } from "lucide-react";
import { ExcelToPdfConverter } from "@/components/ExcelToPdfConverter";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("excel-para-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };
export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>Excel para PDF</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><ToolIcon tool={tool} /><div><h1>Excel para PDF online</h1><p>Converta arquivos XLS e XLSX em PDF para compartilhar suas tabelas com facilidade.</p></div></header>
        <ExcelToPdfConverter />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
    <section className="tool-content">
      <div>
        <h2>Como converter Excel para PDF</h2>
        <div className="mini-steps">
          <span><Upload /> Envie sua planilha</span>
          <span><Maximize2 /> Escolha a orientacao</span>
          <span><FileCheck /> Baixe o PDF pronto</span>
        </div>
      </div>
      <div>
        <h2>Quando usar</h2>
        <ul>
          <li>Enviar relatorios e tabelas sem depender do Excel.</li>
          <li>Compartilhar orcamentos, listas e controles internos.</li>
          <li>Salvar planilhas em um formato facil de abrir.</li>
          <li>Gerar uma versao final para impressao ou envio.</li>
        </ul>
      </div>
    </section>
  </article>;
}
