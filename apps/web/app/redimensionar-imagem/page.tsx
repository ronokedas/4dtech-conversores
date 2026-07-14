import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("redimensionar-imagem")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="resize-image" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" allowedExtensions={["png", "jpg", "jpeg", "webp"]} maxMb={15} icon="image" uploadTitle="Arraste sua imagem aqui" idleHint="escolha uma imagem" smallHint="JPG, PNG ou WebP ate 15 MB" buttonText="Redimensionar imagem" busyText="Redimensionando..." privacyText="A imagem original e a copia redimensionada sao temporarias." fields={[{ name: "width", label: "Largura px", type: "number", placeholder: "Ex: 1200", min: 16, max: 8000 }, { name: "height", label: "Altura px", type: "number", placeholder: "Opcional", min: 16, max: 8000 }, { name: "quality", label: "Qualidade", type: "select", defaultValue: "85", options: [{ value: "70", label: "Leve" }, { value: "85", label: "Normal" }, { value: "95", label: "Alta" }] }]}>
    <section className="tool-content"><div><h2>Como redimensionar imagem</h2><p>Informe largura, altura ou os dois. A ferramenta mantém a proporção da imagem e evita aumentar além do tamanho original.</p></div><div><h2>Uso comum</h2><ul><li>Criar banners e miniaturas.</li><li>Ajustar foto para perfil.</li><li>Padronizar imagens de produtos.</li><li>Reduzir dimensões para páginas mais rápidas.</li></ul></div></section>
  </UtilityModulePage>;
}
