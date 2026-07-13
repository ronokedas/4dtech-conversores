import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("juntar-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="merge-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} multiple maxFiles={20} uploadTitle="Arraste seus PDFs aqui" idleHint="escolha dois ou mais PDFs" smallHint="Ate 20 PDFs, 25 MB por arquivo" buttonText="Juntar PDF" busyText="Juntando..." privacyText="Os PDFs enviados e o arquivo final expiram automaticamente.">
    <section className="tool-content"><div><h2>Como juntar PDFs</h2><p>Selecione dois ou mais arquivos PDF na ordem desejada. O sistema cria um unico documento com as paginas combinadas.</p></div><div><h2>Quando usar</h2><ul><li>Unir contratos e anexos.</li><li>Montar processos, comprovantes e relatorios.</li><li>Enviar varios documentos em um so PDF.</li></ul></div></section>
  </UtilityModulePage>;
}
