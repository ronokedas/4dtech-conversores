import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("proteger-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="protect-pdf" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste seu PDF aqui" idleHint="escolha um PDF" smallHint="PDF ate 25 MB" buttonText="Proteger PDF" busyText="Protegendo..." privacyText="Nao guardamos sua senha; ela e usada apenas durante o processamento temporario." fields={[{ name: "password", label: "Senha", type: "password", placeholder: "Minimo 4 caracteres" }]}>
    <section className="tool-content"><div><h2>Como proteger PDF</h2><p>Envie o PDF, defina uma senha e baixe uma copia protegida. Guarde a senha em local seguro, pois ela sera necessaria para abrir o arquivo.</p></div><div><h2>Quando usar</h2><p>Use em documentos sensiveis, propostas, relatorios internos e arquivos enviados por canais compartilhados.</p></div></section>
  </UtilityModulePage>;
}
