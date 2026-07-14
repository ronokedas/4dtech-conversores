import type { Metadata } from "next";
import { Code2 } from "lucide-react";
import { Converter } from "@/components/Converter";
import { RelatedTools } from "@/components/RelatedTools";
import { SeoSections } from "@/components/SeoSections";

export const metadata: Metadata = {
  title: "Converter HTML para PDF online | Arquivo, ZIP ou URL",
  description: "Converta HTML para PDF online usando arquivo HTML, ZIP com CSS/imagens ou URL pública. Gere PDF em A4 com download temporário.",
  alternates: { canonical: "/html-para-pdf" },
};

export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/ferramentas">Conversores</a><span>›</span><span>HTML para PDF</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><span className="tool-hero-icon accent-html"><Code2 /></span><div><h1>HTML para PDF online</h1><p>Envie um arquivo HTML, um ZIP completo ou cole uma URL pública para baixar o PDF pronto.</p></div></header>
        <Converter />
        <SeoSections
          intro={{
            title: "Gere PDF a partir de HTML, ZIP ou página pública",
            body: "Esta ferramenta converte páginas HTML em PDF preservando layout, imagens, CSS, cores e estrutura sempre que os recursos estão disponíveis para carregamento.",
          }}
          howTo={[
            "Escolha a aba Arquivo para enviar HTML/ZIP ou a aba URL para informar uma página pública.",
            "Confira as opções avançadas se precisar ajustar tamanho, orientação ou margens.",
            "Clique em Converter para PDF e aguarde a renderização.",
            "Baixe o PDF final pela página temporária de resultado.",
          ]}
          privacy="Arquivos enviados, URLs e PDFs gerados são temporários. O link de download não entra no sitemap e o resultado é removido automaticamente após o download ou expiração."
          tips={[
            "Para ZIP, inclua o index.html junto com CSS, imagens e fontes usadas pela página.",
            "URLs precisam ser públicas e acessíveis sem login.",
            "Use CSS de impressão quando quiser controlar quebras de página.",
            "Evite recursos externos bloqueados por autenticação, pois eles podem não aparecer no PDF.",
          ]}
        />
      </div>
      <RelatedTools activeSlug="html-para-pdf" />
    </div>
  </article>;
}
