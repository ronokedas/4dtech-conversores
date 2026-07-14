import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("converter-imagem")!;

export const metadata: Metadata = {
  title: "Converter imagem JPG, PNG e WebP online",
  description: "Converta imagens entre JPG, PNG e WebP online. Escolha o formato final e baixe uma nova versão temporária em poucos segundos.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="convert-image" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" allowedExtensions={["png", "jpg", "jpeg", "webp"]} maxMb={15} icon="image" uploadTitle="Arraste sua imagem aqui" idleHint="escolha uma imagem" smallHint="JPG, PNG ou WebP até 15 MB" buttonText="Converter imagem" busyText="Convertendo..." privacyText="A imagem original e a convertida são temporárias e removidas automaticamente." fields={[{ name: "format", label: "Formato final", type: "select", defaultValue: "webp", options: [{ value: "webp", label: "WebP" }, { value: "jpeg", label: "JPG" }, { value: "png", label: "PNG" }] }, { name: "quality", label: "Qualidade", type: "select", defaultValue: "85", options: [{ value: "70", label: "Leve" }, { value: "85", label: "Normal" }, { value: "95", label: "Alta" }] }]}>
    <SeoSections
      intro={{
        title: "Converta imagens para o formato certo",
        body: "A ferramenta converte JPG, PNG e WebP para facilitar publicação em sites, compatibilidade com sistemas, envio de arquivos e uso em materiais digitais.",
      }}
      howTo={[
        "Envie uma imagem JPG, PNG ou WebP.",
        "Escolha o formato final: WebP, JPG ou PNG.",
        "Defina a qualidade e clique em Converter imagem.",
        "Baixe o novo arquivo quando ele ficar pronto.",
      ]}
      privacy="A imagem enviada e a versão convertida são temporárias. O resultado fica disponível apenas pelo link de download e é removido automaticamente."
      tips={[
        "WebP costuma ser uma boa escolha para sites por gerar arquivos leves.",
        "JPG é indicado para fotos e ampla compatibilidade.",
        "PNG é melhor quando a imagem precisa manter transparência.",
        "Se o objetivo é reduzir peso, use também a ferramenta Comprimir imagem.",
      ]}
    />
  </UtilityModulePage>;
}
