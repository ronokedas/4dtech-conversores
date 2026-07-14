import type { Metadata } from "next";
import { CheckCircle2, Download, QrCode } from "lucide-react";
import { QrCodeForm } from "@/components/QrCodeForm";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("qr-code")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: tool.href },
};

export default function QrCodePage() {
  return <article className="container tool-page">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>{tool.title}</span></nav>
    <div className="tool-layout">
      <div>
        <header className="tool-header">
          <ToolIcon tool={tool} />
          <div><h1>{tool.title}</h1><p>{tool.longDescription}</p></div>
        </header>
        <QrCodeForm />
        <section className="tool-content">
          <div>
            <h2>Como criar QR Code online</h2>
            <div className="mini-steps">
              <span><QrCode /> Digite o link ou texto</span>
              <span><CheckCircle2 /> Escolha tamanho e cor</span>
              <span><Download /> Baixe em PNG</span>
            </div>
          </div>
          <div>
            <h2>Quando usar esta ferramenta?</h2>
            <p>Use para criar QR Code de site, WhatsApp, cardapio, cupom, endereco, rede social, evento ou qualquer texto curto. O PNG pode ser usado em cartazes, etiquetas, documentos e publicacoes digitais.</p>
            <p>Para melhor leitura, prefira links curtos e mantenha bom contraste entre a cor do QR Code e o fundo branco.</p>
          </div>
        </section>
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
  </article>;
}
