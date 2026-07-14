import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("comprimir-imagem")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="compress-image" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" allowedExtensions={["png", "jpg", "jpeg", "webp"]} maxMb={15} icon="image" uploadTitle="Arraste sua imagem aqui" idleHint="escolha uma imagem" smallHint="JPG, PNG ou WebP até 15 MB" buttonText="Comprimir imagem" busyText="Comprimindo..." privacyText="A imagem original e o arquivo final são temporários e removidos automaticamente." fields={[{ name: "quality", label: "Qualidade", type: "select", defaultValue: "75", options: [{ value: "60", label: "Menor arquivo" }, { value: "75", label: "Equilibrado" }, { value: "90", label: "Mais qualidade" }] }]}>
    <section className="tool-content"><div><h2>Como comprimir imagem</h2><p>Envie JPG, PNG ou WebP, escolha o nível de qualidade e baixe uma versão mais leve para usar online.</p></div><div><h2>Quando ajuda</h2><ul><li>Publicar imagens em sites.</li><li>Enviar por e-mail ou WhatsApp.</li><li>Reduzir peso de fotos para lojas virtuais.</li><li>Melhorar carregamento em páginas.</li></ul></div></section>
  </UtilityModulePage>;
}
