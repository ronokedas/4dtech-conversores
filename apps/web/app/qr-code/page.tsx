import type { Metadata } from "next";
import { QrCodeForm } from "@/components/QrCodeForm";
import { RelatedTools } from "@/components/RelatedTools";
import { SeoSections } from "@/components/SeoSections";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("qr-code")!;

export const metadata: Metadata = {
  title: "Gerador de QR Code online grátis | Baixar PNG",
  description: "Crie QR Code online para link, texto, WhatsApp, cardápio, evento ou rede social. Personalize tamanho e cor e baixe em PNG.",
  alternates: { canonical: tool.href },
};

export default function QrCodePage() {
  return <article className="container tool-page">
    <nav className="breadcrumb" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>{tool.title}</span></nav>
    <div className="tool-layout">
      <div>
        <header className="tool-header">
          <ToolIcon tool={tool} />
          <div><h1>{tool.title}</h1><p>Digite um link ou texto, personalize tamanho e cor, e baixe seu QR Code em PNG pronto para usar.</p></div>
        </header>
        <QrCodeForm />
        <SeoSections
          intro={{
            title: "Crie QR Code para links, textos e materiais impressos",
            body: "O gerador de QR Code facilita compartilhar URLs, contatos, cardápios, cupons, redes sociais, eventos e textos curtos em uma imagem PNG.",
          }}
          howTo={[
            "Digite o link, texto ou informação que será aberta pelo QR Code.",
            "Escolha o tamanho e a cor da imagem.",
            "Clique em Gerar QR Code.",
            "Baixe o PNG e teste com a câmera do celular antes de imprimir.",
          ]}
          privacy="O conteúdo informado é usado apenas para gerar a imagem do QR Code. O arquivo final é temporário e o link de download expira automaticamente."
          tips={[
            "Use links curtos para gerar QR Codes mais simples e fáceis de ler.",
            "Mantenha bom contraste entre a cor do QR Code e o fundo.",
            "Teste o código em mais de um celular antes de usar em cartazes ou embalagens.",
            "Evite colocar informações sensíveis em QR Codes públicos.",
          ]}
        />
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
  </article>;
}
