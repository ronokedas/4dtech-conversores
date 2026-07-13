import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("dividir-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="split-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste seu PDF aqui" idleHint="escolha um PDF" smallHint="Use paginas como 1,3,5-7" buttonText="Dividir PDF" busyText="Separando paginas..." privacyText="O PDF original e o resultado sao removidos apos o download." fields={[{ name: "ranges", label: "Paginas para extrair", defaultValue: "1", placeholder: "Ex.: 1,3,5-7" }]}>
    <section className="tool-content"><div><h2>Como dividir PDF</h2><p>Envie o PDF e informe quais paginas deseja manter. Voce pode usar numeros separados por virgula ou intervalos, como 1,3,5-7.</p></div><div><h2>Uso comum</h2><p>Perfeito para extrair apenas uma certidao, uma pagina assinada, uma nota fiscal ou um trecho especifico de um documento maior.</p></div></section>
  </UtilityModulePage>;
}
