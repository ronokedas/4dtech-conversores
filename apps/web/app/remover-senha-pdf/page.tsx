import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("remover-senha-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="unlock-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste o PDF protegido aqui" idleHint="escolha um PDF" smallHint="Informe a senha atual do arquivo" buttonText="Remover senha" busyText="Desbloqueando..." privacyText="Use apenas em PDFs seus ou quando voce tiver autorizacao e souber a senha atual." fields={[{ name: "password", label: "Senha atual", type: "password", placeholder: "Senha do PDF" }]}>
    <section className="tool-content"><div><h2>Como remover senha do PDF</h2><p>Envie o arquivo protegido e informe a senha correta. O sistema gera uma copia sem senha para facilitar o uso posterior.</p></div><div><h2>Importante</h2><p>Esta ferramenta nao quebra senha. Ela remove a protecao somente quando a senha atual e informada corretamente.</p></div></section>
  </UtilityModulePage>;
}
