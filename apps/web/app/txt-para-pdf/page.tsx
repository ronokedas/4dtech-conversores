import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("txt-para-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="txt-pdf" accept=".txt,text/plain" allowedExtensions={["txt"]} maxMb={25} uploadTitle="Arraste seu TXT aqui" idleHint="escolha um arquivo TXT" smallHint="TXT ate 25 MB" buttonText="Converter TXT para PDF" busyText="Criando PDF..." privacyText="O TXT original e o PDF final sao temporarios e removidos automaticamente." fields={[{ name: "title", label: "Titulo opcional", placeholder: "Ex: Minhas anotacoes" }, { name: "fontSize", label: "Tamanho do texto", type: "select", defaultValue: "12", options: [{ value: "10", label: "Pequeno" }, { value: "12", label: "Normal" }, { value: "14", label: "Grande" }, { value: "16", label: "Muito grande" }] }]}>
    <section className="tool-content"><div><h2>Como converter TXT em PDF</h2><p>Envie seu arquivo de texto, escolha um titulo se quiser e baixe um PDF organizado para imprimir, arquivar ou compartilhar.</p></div><div><h2>Quando usar</h2><ul><li>Anotacoes simples.</li><li>Rascunhos e listas.</li><li>Textos exportados de sistemas.</li><li>Documentos que precisam virar PDF rapidamente.</li></ul></div></section>
  </UtilityModulePage>;
}
