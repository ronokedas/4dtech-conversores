import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("converter-imagem")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="convert-image" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" allowedExtensions={["png", "jpg", "jpeg", "webp"]} maxMb={15} icon="image" uploadTitle="Arraste sua imagem aqui" idleHint="escolha uma imagem" smallHint="JPG, PNG ou WebP ate 15 MB" buttonText="Converter imagem" busyText="Convertendo..." privacyText="A imagem original e a convertida sao temporarias e removidas automaticamente." fields={[{ name: "format", label: "Formato final", type: "select", defaultValue: "webp", options: [{ value: "webp", label: "WebP" }, { value: "jpeg", label: "JPG" }, { value: "png", label: "PNG" }] }, { name: "quality", label: "Qualidade", type: "select", defaultValue: "85", options: [{ value: "70", label: "Leve" }, { value: "85", label: "Normal" }, { value: "95", label: "Alta" }] }]}>
    <section className="tool-content"><div><h2>Como converter JPG, PNG e WebP</h2><p>Envie a imagem, escolha o formato final e baixe uma nova versão em poucos segundos.</p></div><div><h2>Qual formato escolher?</h2><ul><li>WebP: ótimo para sites e arquivos leves.</li><li>JPG: ideal para fotos e compatibilidade.</li><li>PNG: bom para imagens com transparência.</li></ul></div></section>
  </UtilityModulePage>;
}
