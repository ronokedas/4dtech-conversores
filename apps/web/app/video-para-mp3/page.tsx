import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("video-para-mp3")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="video-mp3" accept=".mp4,.mov,.mkv,.webm,.avi,.mpeg,.mpg,.m4v,video/*" allowedExtensions={["mp4", "mov", "mkv", "webm", "avi", "mpeg", "mpg", "m4v"]} maxMb={100} icon="audio" uploadTitle="Arraste seu vídeo aqui" idleHint="escolha um vídeo" smallHint="MP4, MOV, MKV, WEBM ou AVI ate 100 MB" buttonText="Converter vídeo para MP3" busyText="Extraindo áudio..." privacyText="O vídeo original e o MP3 final sao temporarios e removidos automaticamente." fields={[{ name: "bitrate", label: "Qualidade do MP3", type: "select", defaultValue: "128k", options: [{ value: "96k", label: "Leve" }, { value: "128k", label: "Normal" }, { value: "192k", label: "Alta" }, { value: "256k", label: "Muito alta" }] }]}>
    <section className="tool-content"><div><h2>Como converter vídeo em MP3</h2><p>Envie um vídeo, escolha a qualidade do áudio e baixe apenas o som em MP3. O processamento é feito em fila temporária.</p></div><div><h2>Boas práticas</h2><ul><li>Use vídeos curtos em VPS pequena.</li><li>128k costuma ser suficiente para voz.</li><li>192k ou 256k preservam melhor músicas e trilhas.</li><li>Arquivos muito grandes podem demorar mais.</li></ul></div></section>
  </UtilityModulePage>;
}
