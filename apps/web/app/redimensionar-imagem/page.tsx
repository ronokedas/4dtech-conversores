import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("redimensionar-imagem")!;

export const metadata: Metadata = {
  title: "Redimensionar imagem online | Alterar largura e altura",
  description: "Redimensione imagens JPG, PNG e WebP online por largura ou altura. Gere uma cópia otimizada para perfil, produto, banner, site ou rede social.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="resize-image" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" allowedExtensions={["png", "jpg", "jpeg", "webp"]} maxMb={15} icon="image" uploadTitle="Arraste sua imagem aqui" idleHint="escolha uma imagem" smallHint="JPG, PNG ou WebP até 15 MB" buttonText="Redimensionar imagem" busyText="Redimensionando..." privacyText="A imagem original e a cópia redimensionada são temporárias." fields={[{ name: "width", label: "Largura px", type: "number", placeholder: "Ex: 1200", min: 16, max: 8000 }, { name: "height", label: "Altura px", type: "number", placeholder: "Opcional", min: 16, max: 8000 }, { name: "quality", label: "Qualidade", type: "select", defaultValue: "85", options: [{ value: "70", label: "Leve" }, { value: "85", label: "Normal" }, { value: "95", label: "Alta" }] }]}>
    <SeoSections
      intro={{
        title: "Ajuste o tamanho da imagem em pixels",
        body: "Use o redimensionador para criar imagens no tamanho certo para sites, perfis, miniaturas, lojas virtuais, banners e sistemas que exigem largura ou altura específica.",
      }}
      howTo={[
        "Envie uma imagem JPG, PNG ou WebP.",
        "Informe a largura, a altura ou os dois valores em pixels.",
        "Escolha a qualidade final e clique em Redimensionar imagem.",
        "Baixe a cópia redimensionada quando o processamento terminar.",
      ]}
      privacy="A imagem original e a versão redimensionada são arquivos temporários. O processamento não cria galeria pública e o resultado expira automaticamente."
      tips={[
        "Informe apenas largura ou apenas altura para manter a proporção original com mais segurança.",
        "Evite aumentar imagens pequenas demais, pois isso pode deixar o resultado borrado.",
        "Para fotos de produtos, use sempre o mesmo tamanho para manter a vitrine padronizada.",
        "Depois de redimensionar, você também pode comprimir a imagem para reduzir o peso.",
      ]}
    />
  </UtilityModulePage>;
}
