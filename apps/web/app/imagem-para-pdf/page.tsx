import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("imagem-para-pdf")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="image-pdf" accept=".png,.jpg,.jpeg,image/png,image/jpeg" allowedExtensions={["png", "jpg", "jpeg"]} multiple maxFiles={20} maxMb={15} icon="image" uploadTitle="Arraste suas imagens aqui" idleHint="escolha imagens" smallHint="PNG ou JPG, ate 15 MB cada" buttonText="Converter imagens para PDF" busyText="Criando PDF..." privacyText="As imagens e o PDF final sao temporarios e removidos automaticamente.">
    <section className="tool-content"><div><h2>Como converter imagem em PDF</h2><p>Envie uma ou varias imagens PNG/JPG. Cada imagem vira uma pagina A4 centralizada dentro de um unico PDF.</p></div><div><h2>Quando ajuda</h2><ul><li>Salvar comprovantes em PDF.</li><li>Enviar fotos como documento unico.</li><li>Organizar capturas de tela para impressao.</li></ul></div></section>
  </UtilityModulePage>;
}
