import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("markdown-para-pdf")!;

export const metadata: Metadata = {
  title: "Converter Markdown para PDF online | MD para PDF",
  description: "Converta arquivos Markdown ou MD em PDF online com títulos, listas e leitura limpa. Ótimo para documentação, README e anotações.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="markdown-pdf" accept=".md,.markdown,.txt,text/markdown,text/plain" allowedExtensions={["md", "markdown", "txt"]} maxMb={25} uploadTitle="Arraste seu Markdown aqui" idleHint="escolha um arquivo MD" smallHint="MD, Markdown ou TXT até 25 MB" buttonText="Converter Markdown para PDF" busyText="Criando PDF..." privacyText="O Markdown original e o PDF final são temporários e removidos automaticamente." fields={[{ name: "title", label: "Título opcional", placeholder: "Ex: Documentação" }, { name: "fontSize", label: "Tamanho do texto", type: "select", defaultValue: "12", options: [{ value: "10", label: "Pequeno" }, { value: "12", label: "Normal" }, { value: "14", label: "Grande" }, { value: "16", label: "Muito grande" }] }]}>
    <SeoSections
      intro={{
        title: "Transforme Markdown em PDF para compartilhar",
        body: "Use este conversor para salvar documentações, READMEs, roteiros, checklists e notas técnicas em PDF. O arquivo final mantém uma estrutura limpa para leitura e envio.",
      }}
      howTo={[
        "Envie um arquivo .md, .markdown ou .txt com conteúdo em Markdown.",
        "Adicione um título opcional se quiser destacar o documento.",
        "Escolha o tamanho do texto e clique em Converter Markdown para PDF.",
        "Baixe o PDF final na página de resultado temporária.",
      ]}
      privacy="O Markdown enviado é processado temporariamente para gerar o PDF. O arquivo original e o resultado são removidos automaticamente, sem histórico público de documentos."
      tips={[
        "Use títulos com #, ## e ### para criar uma hierarquia clara no PDF.",
        "Listas, parágrafos e blocos de texto simples costumam gerar os melhores resultados.",
        "Evite depender de imagens externas privadas, pois elas podem não carregar no processamento.",
        "Para texto sem formatação, o módulo TXT para PDF pode ser mais direto.",
      ]}
    />
  </UtilityModulePage>;
}
