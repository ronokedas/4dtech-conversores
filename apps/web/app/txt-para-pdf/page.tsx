import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("txt-para-pdf")!;

export const metadata: Metadata = {
  title: "Converter TXT para PDF online grátis",
  description: "Transforme arquivos TXT em PDF online com título opcional, texto legível e download temporário. Simples, grátis e sem instalar programas.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="txt-pdf" accept=".txt,text/plain" allowedExtensions={["txt"]} maxMb={25} uploadTitle="Arraste seu TXT aqui" idleHint="escolha um arquivo TXT" smallHint="TXT até 25 MB" buttonText="Converter TXT para PDF" busyText="Criando PDF..." privacyText="O TXT original e o PDF final são temporários e removidos automaticamente." fields={[{ name: "title", label: "Título opcional", placeholder: "Ex: Minhas anotações" }, { name: "fontSize", label: "Tamanho do texto", type: "select", defaultValue: "12", options: [{ value: "10", label: "Pequeno" }, { value: "12", label: "Normal" }, { value: "14", label: "Grande" }, { value: "16", label: "Muito grande" }] }]}>
    <SeoSections
      intro={{
        title: "Converta texto simples em PDF organizado",
        body: "A ferramenta TXT para PDF é ideal para transformar anotações, listas, relatórios exportados e arquivos de texto puro em um documento fácil de imprimir, enviar por e-mail ou arquivar.",
      }}
      howTo={[
        "Clique em escolher arquivo ou arraste um TXT para a área de envio.",
        "Se quiser, informe um título para aparecer no topo do PDF.",
        "Escolha o tamanho do texto e clique em Converter TXT para PDF.",
        "Aguarde o processamento e baixe o PDF na página de resultado.",
      ]}
      privacy="O arquivo TXT é usado apenas para gerar o PDF. O conteúdo não entra em banco de dados permanente e os arquivos temporários expiram automaticamente após o download ou depois do prazo de limpeza."
      tips={[
        "Use TXT em UTF-8 para preservar acentos e caracteres especiais.",
        "Quebras de linha no arquivo original ajudam a deixar o PDF mais legível.",
        "Para documentos longos, escolha tamanho de texto normal ou pequeno.",
        "Se precisar de títulos e listas formatadas, use também o conversor Markdown para PDF.",
      ]}
    />
  </UtilityModulePage>;
}
