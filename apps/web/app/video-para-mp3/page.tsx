import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("video-para-mp3")!;

export const metadata: Metadata = {
  title: "Converter vídeo para MP3 online | Extrair áudio",
  description: "Extraia áudio de vídeos MP4, MOV, MKV, WEBM ou AVI e baixe em MP3. Conversor online com qualidade ajustável e download temporário.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="video-mp3" accept=".mp4,.mov,.mkv,.webm,.avi,.mpeg,.mpg,.m4v,video/*" allowedExtensions={["mp4", "mov", "mkv", "webm", "avi", "mpeg", "mpg", "m4v"]} maxMb={100} icon="audio" uploadTitle="Arraste seu vídeo aqui" idleHint="escolha um vídeo" smallHint="MP4, MOV, MKV, WEBM ou AVI até 100 MB" buttonText="Converter vídeo para MP3" busyText="Extraindo áudio..." privacyText="O vídeo original e o MP3 final são temporários e removidos automaticamente." fields={[{ name: "bitrate", label: "Qualidade do MP3", type: "select", defaultValue: "128k", options: [{ value: "96k", label: "Leve" }, { value: "128k", label: "Normal" }, { value: "192k", label: "Alta" }, { value: "256k", label: "Muito alta" }] }]}>
    <SeoSections
      intro={{
        title: "Extraia o áudio de um vídeo e salve em MP3",
        body: "Use o conversor de vídeo para MP3 para transformar gravações, aulas, reuniões, clipes e arquivos de vídeo em áudio separado, sem instalar programa no computador.",
      }}
      howTo={[
        "Envie um vídeo nos formatos MP4, MOV, MKV, WEBM ou AVI.",
        "Escolha a qualidade do MP3 conforme seu objetivo.",
        "Clique em Converter vídeo para MP3 e aguarde a extração do áudio.",
        "Baixe o MP3 final na página de resultado.",
      ]}
      privacy="O vídeo enviado e o MP3 gerado são temporários. Os arquivos são removidos automaticamente após o download ou quando o trabalho expira."
      tips={[
        "Para voz, 128k costuma entregar boa qualidade com arquivo menor.",
        "Para música ou trilhas, 192k ou 256k preservam melhor os detalhes.",
        "Vídeos sem faixa de áudio não geram um MP3 útil.",
        "Em VPS pequena, vídeos curtos processam com mais estabilidade.",
      ]}
    />
  </UtilityModulePage>;
}
