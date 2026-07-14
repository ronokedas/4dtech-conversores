import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("markdown-para-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="markdown-pdf" accept=".md,.markdown,.txt,text/markdown,text/plain" allowedExtensions={["md", "markdown", "txt"]} maxMb={25} uploadTitle="Arraste seu Markdown aqui" idleHint="escolha um arquivo MD" smallHint="MD, Markdown ou TXT ate 25 MB" buttonText="Converter Markdown para PDF" busyText="Criando PDF..." privacyText="O Markdown original e o PDF final sao temporarios e removidos automaticamente." fields={[{ name: "title", label: "Titulo opcional", placeholder: "Ex: Documentacao" }, { name: "fontSize", label: "Tamanho do texto", type: "select", defaultValue: "12", options: [{ value: "10", label: "Pequeno" }, { value: "12", label: "Normal" }, { value: "14", label: "Grande" }, { value: "16", label: "Muito grande" }] }]}>
    <section className="tool-content"><div><h2>Como converter Markdown em PDF</h2><p>Envie um arquivo MD ou Markdown e o sistema cria um PDF com titulos, listas e conteudo principal em uma leitura limpa.</p></div><div><h2>Ideal para</h2><ul><li>Documentacoes simples.</li><li>READMEs e anotações técnicas.</li><li>Roteiros, checklists e guias.</li><li>Conteúdo que precisa ser enviado fora do editor.</li></ul></div></section>
  </UtilityModulePage>;
}
