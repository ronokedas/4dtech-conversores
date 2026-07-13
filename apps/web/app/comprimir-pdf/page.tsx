import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("comprimir-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="compress-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste seu PDF aqui" idleHint="escolha um PDF" smallHint="PDF ate 25 MB" buttonText="Comprimir PDF" busyText="Comprimindo..." privacyText="O PDF original e o comprimido sao apagados automaticamente apos o download.">
    <section className="tool-content"><div><h2>Como comprimir PDF</h2><p>Envie o arquivo, aguarde a otimizacao e baixe uma versao mais leve. E ideal para anexar documentos em e-mail, portais e sistemas com limite de tamanho.</p></div><div><h2>O que observar</h2><p>Alguns PDFs ja chegam muito otimizados. Quando isso acontece, a reducao pode ser pequena, mas o arquivo continua sendo processado com seguranca e download temporario.</p></div></section>
  </UtilityModulePage>;
}
