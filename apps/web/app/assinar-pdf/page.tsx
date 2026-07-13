import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("assinar-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="sign-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste seu PDF aqui" idleHint="escolha um PDF" smallHint="PDF ate 25 MB" buttonText="Assinar PDF" busyText="Aplicando assinatura..." privacyText="O PDF original e assinado sao apagados automaticamente apos o download." fields={[{ name: "text", label: "Assinatura", defaultValue: "Assinado digitalmente", placeholder: "Seu nome ou assinatura" }, { name: "page", label: "Pagina", type: "number", defaultValue: "1", min: 1, max: 999 }, { name: "fontSize", label: "Tamanho", type: "number", defaultValue: "22", min: 8, max: 72 }, { name: "position", label: "Posicao", type: "select", defaultValue: "bottom-left", options: [{ value: "bottom-left", label: "Rodape esquerdo" }, { value: "bottom-center", label: "Rodape centro" }, { value: "top-left", label: "Topo esquerdo" }, { value: "top-center", label: "Topo centro" }, { value: "center", label: "Centro" }] }]}>
    <section className="tool-content"><div><h2>Assinatura textual</h2><p>Este modulo adiciona uma assinatura ou observacao visivel no PDF. Ele nao substitui certificado digital ICP-Brasil, mas ajuda em aprovacoes simples e identificacao visual.</p></div><div><h2>Privacidade</h2><p>O documento fica temporario apenas para processamento e download, seguindo o mesmo fluxo de limpeza dos demais modulos.</p></div></section>
  </UtilityModulePage>;
}
