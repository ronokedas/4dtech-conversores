import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("comprimir-imagem")!;

export const metadata: Metadata = {
  title: "Comprimir imagem online JPG, PNG e WebP | Reduzir tamanho",
  description: "Comprima imagens JPG, PNG ou WebP online para reduzir o tamanho do arquivo mantendo boa qualidade. Ideal para sites, WhatsApp, e-mail e lojas virtuais.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="compress-image" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" allowedExtensions={["png", "jpg", "jpeg", "webp"]} maxMb={15} icon="image" uploadTitle="Arraste sua imagem aqui" idleHint="escolha uma imagem" smallHint="JPG, PNG ou WebP até 15 MB" buttonText="Comprimir imagem" busyText="Comprimindo..." privacyText="A imagem original e o arquivo final são temporários e removidos automaticamente." fields={[{ name: "quality", label: "Qualidade", type: "select", defaultValue: "75", options: [{ value: "60", label: "Menor arquivo" }, { value: "75", label: "Equilibrado" }, { value: "90", label: "Mais qualidade" }] }]}>
    <SeoSections
      intro={{
        title: "Reduza o peso da imagem sem complicação",
        body: "A compressão de imagem ajuda quando uma foto está pesada demais para enviar, publicar em sites, anexar em sistemas ou usar em páginas que precisam carregar rápido.",
      }}
      howTo={[
        "Envie uma imagem JPG, PNG ou WebP.",
        "Escolha o nível de qualidade: menor arquivo, equilibrado ou mais qualidade.",
        "Clique em Comprimir imagem e aguarde alguns segundos.",
        "Baixe a imagem otimizada na página de resultado.",
      ]}
      privacy="A imagem é processada em ambiente temporário e removida automaticamente. O arquivo não fica publicado no site e o link de download expira."
      tips={[
        "Use a opção Equilibrado para a maioria dos sites e redes sociais.",
        "Fotos grandes geralmente reduzem mais do que imagens que já foram otimizadas.",
        "PNG com transparência pode ficar maior do que JPG, dependendo do conteúdo.",
        "Para mudar largura e altura, use o módulo Redimensionar imagem.",
      ]}
    />
  </UtilityModulePage>;
}
