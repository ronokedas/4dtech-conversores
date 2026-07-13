import type { Metadata } from "next";
import { FileImage, Upload, WandSparkles, Download } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { BackgroundRemover } from "@/components/BackgroundRemover";
import { RelatedTools } from "@/components/RelatedTools";

export const metadata: Metadata = {
  title: "Remover fundo de imagem online",
  description: "Remova fundo de imagem PNG ou JPG online e baixe o resultado em PNG transparente.",
  alternates: { canonical: "/remover-fundo-de-imagem" },
};

export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas#imagem">Imagem</a><span>›</span><span>Remover fundo de imagem</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><span className="tool-hero-icon accent-image"><FileImage /></span><div><h1>Remover fundo de imagem online</h1><p>Envie uma imagem PNG ou JPG e baixe o resultado com fundo transparente.</p></div></header>
        <BackgroundRemover />
      </div>
      <RelatedTools activeSlug="remover-fundo-de-imagem" />
    </div>
    <section className="tool-content two-columns">
      <div><h2>Como remover o fundo da imagem</h2><div className="mini-steps"><span><Upload /> Envie sua imagem</span><span><WandSparkles /> Processamento automatico</span><span><Download /> Baixe o resultado</span></div></div>
      <div><h2>Quando usar imagem transparente</h2><ul><li>Logotipos e marcas.</li><li>Fotos de produtos para e-commerce.</li><li>Montagens e apresentacoes.</li><li>Materiais de marketing e redes sociais.</li></ul></div>
    </section>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} />
  </article>;
}
