import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("organizar-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="organize-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste seu PDF aqui" idleHint="escolha um PDF" smallHint="Ordem como 3,1,2 ou 1-4,7" buttonText="Organizar PDF" busyText="Organizando..." privacyText="O PDF enviado e o reorganizado sao apagados automaticamente apos o download." fields={[{ name: "order", label: "Nova ordem das paginas", defaultValue: "1", placeholder: "Ex.: 3,1,2 ou 1-4,7" }]}>
    <section className="tool-content"><div><h2>Como organizar PDF</h2><p>Informe a ordem desejada das paginas. Voce pode repetir, pular ou reordenar paginas usando numeros e intervalos.</p></div><div><h2>Exemplos</h2><ul><li><code>3,1,2</code> coloca a pagina 3 primeiro.</li><li><code>1-5</code> mantem apenas as cinco primeiras.</li><li><code>2,4-6</code> remove paginas fora da lista.</li></ul></div></section>
  </UtilityModulePage>;
}
