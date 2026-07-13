import type { Metadata } from "next";
import { FileCheck, Rows3, Upload } from "lucide-react";
import { PdfToExcelConverter } from "@/components/PdfToExcelConverter";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("pdf-para-excel")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };
export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>PDF para Excel</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><ToolIcon tool={tool} /><div><h1>PDF para Excel online</h1><p>Converta dados de PDFs textuais em uma planilha XLSX para organizar e editar.</p></div></header>
        <PdfToExcelConverter />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
    <section className="tool-content">
      <div>
        <h2>Como converter PDF para Excel</h2>
        <div className="mini-steps">
          <span><Upload /> Envie seu PDF</span>
          <span><Rows3 /> Extraia os dados</span>
          <span><FileCheck /> Baixe o XLSX</span>
        </div>
      </div>
      <div>
        <h2>Quando usar</h2>
        <ul>
          <li>Levar tabelas simples de PDF para planilha.</li>
          <li>Organizar listas, relatórios e dados textuais.</li>
          <li>Editar informações em Excel, Google Sheets ou LibreOffice.</li>
          <li>Evitar copiar e colar manualmente linha por linha.</li>
        </ul>
      </div>
    </section>
  </article>;
}
