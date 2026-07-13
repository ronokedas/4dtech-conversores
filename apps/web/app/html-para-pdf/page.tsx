import type { Metadata } from "next";
import { Code2 } from "lucide-react";
import { Converter } from "@/components/Converter";
import { RelatedTools } from "@/components/RelatedTools";

export const metadata: Metadata = {
  title: "HTML para PDF online gratis",
  description: "Converta HTML, ZIP ou URL em PDF online com qualidade e exclusao automatica dos arquivos.",
  alternates: { canonical: "/html-para-pdf" },
};

export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Conversores</a><span>›</span><span>HTML para PDF</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><span className="tool-hero-icon accent-html"><Code2 /></span><div><h1>HTML para PDF online</h1><p>Envie um arquivo HTML, um ZIP completo ou cole uma URL publica para baixar o PDF pronto.</p></div></header>
        <Converter />
      </div>
      <RelatedTools activeSlug="html-para-pdf" />
    </div>
    <section className="tool-content">
      <div><h2>Como converter HTML em PDF</h2><p>Escolha um HTML, envie um ZIP com imagens e estilos ou use a aba URL. O processamento cria um PDF temporario e libera um link unico para download.</p></div>
      <div><h2>Quando usar</h2><ul><li>Salvar paginas e relatorios em PDF.</li><li>Gerar comprovantes, propostas e apresentacoes em formato fixo.</li><li>Preservar CSS, imagens e fontes em um arquivo compartilhavel.</li></ul></div>
    </section>
  </article>;
}
