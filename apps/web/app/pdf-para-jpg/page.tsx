import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("pdf-para-jpg")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="pdf-jpg" accept=".pdf,application/pdf" allowedExtensions={["pdf"]} uploadTitle="Arraste seu PDF aqui" idleHint="escolha um PDF" smallHint="PDF ate 25 MB" buttonText="Converter PDF para JPG" busyText="Convertendo paginas..." privacyText="O PDF e as imagens geradas expiram automaticamente." icon="image">
    <section className="tool-content"><div><h2>Como converter PDF em JPG</h2><p>Envie o PDF e cada pagina sera transformada em uma imagem JPG. O resultado e entregue em um arquivo ZIP para baixar tudo de uma vez.</p></div><div><h2>Quando usar</h2><p>Use quando precisar publicar paginas como imagem, enviar uma visualizacao rapida ou extrair paginas para materiais visuais.</p></div></section>
  </UtilityModulePage>;
}
