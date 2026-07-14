import type { Metadata } from "next";
import { FileImage } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { BackgroundRemover } from "@/components/BackgroundRemover";
import { RelatedTools } from "@/components/RelatedTools";
import { SeoSections } from "@/components/SeoSections";

export const metadata: Metadata = {
  title: "Remover fundo de imagem online | PNG transparente",
  description: "Remova fundo de imagem JPG ou PNG online e baixe o resultado em PNG transparente. Ideal para produtos, logos, redes sociais e apresentações.",
  alternates: { canonical: "/remover-fundo-de-imagem" },
};

export default function Page() {
  return <article className="tool-page container">
    <nav className="breadcrumb" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/ferramentas#imagem">Imagem</a><span>›</span><span>Remover fundo de imagem</span></nav>
    <div className="tool-layout">
      <div className="tool-main">
        <header className="tool-header"><span className="tool-hero-icon accent-image"><FileImage /></span><div><h1>Remover fundo de imagem online</h1><p>Envie uma imagem PNG ou JPG e baixe o resultado com fundo transparente.</p></div></header>
        <BackgroundRemover />
        <SeoSections
          intro={{
            title: "Deixe sua imagem com fundo transparente",
            body: "Remover o fundo é útil para destacar produtos, criar artes, preparar fotos para lojas virtuais, montar apresentações e publicar imagens mais limpas em redes sociais.",
          }}
          howTo={[
            "Envie uma imagem JPG, PNG ou WebP.",
            "Aguarde a remoção automática do fundo.",
            "Confira o resultado na página de download.",
            "Baixe a imagem final em PNG com transparência.",
          ]}
          privacy="A imagem original e o PNG transparente são temporários. O processamento acontece apenas para gerar o resultado e os arquivos são removidos automaticamente."
          tips={[
            "Fotos com bom contraste entre pessoa/produto e fundo tendem a funcionar melhor.",
            "Evite imagens muito escuras, tremidas ou com bordas difíceis de separar.",
            "Use PNG quando precisar manter transparência.",
            "Para publicar em site, depois de remover o fundo você pode comprimir a imagem.",
          ]}
        />
      </div>
      <RelatedTools activeSlug="remover-fundo-de-imagem" />
    </div>
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} />
  </article>;
}
