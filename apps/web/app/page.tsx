import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { ToolsGrid } from "@/components/ToolsGrid";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolBySlug } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Ferramentas online para documentos e imagens",
  description: "Converta HTML, TXT e Markdown em PDF, transcreva áudio, gere QR Code, edite imagens e acesse ferramentas online para Word, Excel e PDF.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const featuredTools = ["html-para-pdf", "txt-para-pdf", "qr-code", "comprimir-imagem", "transcrever-audio-em-texto", "video-para-mp3"].map((slug) => getToolBySlug(slug)!);
  return <>
    <section className="platform-hero">
      <div className="container platform-hero-inner">
        <div className="platform-copy">
          <h1>Ferramentas online para documentos e imagens.</h1>
          <p>Converta documentos em PDF, gere QR Code, transcreva áudio, extraia MP3 de vídeos, edite imagens e acesse módulos exclusivos para Word, Excel e PDF.</p>
        </div>
        <div className="quick-actions" aria-label="Comece agora">
          <h2>Comece agora</h2>
          <div>
            {featuredTools.map((tool) => <Link href={tool.href} className="quick-action" key={tool.slug}>
              <ToolIcon tool={tool} />
              <span><strong>{tool.title}</strong><small>{tool.slug === "html-para-pdf" ? "Converter agora" : "Começar agora"} <ArrowRight size={15} /></small></span>
            </Link>)}
          </div>
        </div>
      </div>
    </section>
    <div className="container">
      <ToolsGrid intro="Ferramentas simples para resolver tarefas de documentos, PDF e imagens sem instalar nada." />
      <section className="trust-band" aria-label="Segurança e privacidade">
        <div><ShieldCheck /><strong>Seguro e privado</strong><p>Seus arquivos temporários são excluídos automaticamente.</p></div>
        <div><LockKeyhole /><strong>100% online</strong><p>Todas as ferramentas funcionam no navegador, sem instalação.</p></div>
        <div><CheckCircle2 /><strong>Grátis para usar</strong><p>Ferramentas essenciais gratuitas para facilitar o seu dia.</p></div>
        <div><MonitorSmartphone /><strong>Funciona em qualquer lugar</strong><p>Acesse de celular, tablet ou computador.</p></div>
      </section>
    </div>
  </>;
}
