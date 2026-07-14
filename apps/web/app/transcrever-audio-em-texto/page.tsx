import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { UtilityModulePage } from "@/components/UtilityModulePage";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("transcrever-audio-em-texto")!;

export const metadata: Metadata = {
  title: "Transcrever áudio em texto online | Áudio para TXT",
  description: "Transcreva áudio ou vídeo curto em texto online. Envie MP3, WAV, M4A, OGG, WEBM ou MP4 e baixe a transcrição em TXT.",
  alternates: { canonical: tool.href },
};

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="audio-text" accept=".mp3,.wav,.m4a,.ogg,.webm,.mp4,audio/*,video/mp4,video/webm" allowedExtensions={["mp3", "wav", "m4a", "ogg", "webm", "mp4", "mpeg", "mpga"]} maxMb={50} uploadTitle="Arraste seu áudio aqui" idleHint="escolha um áudio ou vídeo" smallHint="MP3, WAV, M4A, OGG, WEBM ou MP4 até 50 MB" buttonText="Transcrever áudio" busyText="Enviando para transcrição..." privacyText="O arquivo original e a transcrição são temporários e expiram automaticamente." icon="audio" fields={[{ name: "language", label: "Idioma", type: "select", defaultValue: "pt", options: [{ value: "pt", label: "Português" }, { value: "en", label: "Inglês" }, { value: "es", label: "Espanhol" }, { value: "auto", label: "Detectar automaticamente" }] }]}>
    <SeoSections
      intro={{
        title: "Transforme fala em texto editável",
        body: "A transcrição de áudio em texto ajuda a transformar gravações, áudios de WhatsApp, aulas, entrevistas e reuniões curtas em um arquivo TXT que pode ser copiado, revisado e usado em documentos.",
      }}
      howTo={[
        "Envie um áudio ou vídeo com fala clara.",
        "Escolha o idioma principal ou use a detecção automática.",
        "Clique em Transcrever áudio e aguarde o processamento.",
        "Baixe o TXT final e revise nomes próprios, pontuação e trechos técnicos.",
      ]}
      privacy="O áudio enviado e o texto gerado são temporários. O sistema não cria histórico público de transcrições e os arquivos expiram automaticamente após o download ou limpeza."
      tips={[
        "Áudios com menos ruído geram transcrições mais fáceis de revisar.",
        "Arquivos curtos processam melhor em uma VPS pequena.",
        "Falas sobrepostas ou música de fundo podem reduzir a precisão.",
        "Sempre revise nomes, números e termos técnicos antes de usar o texto final.",
      ]}
    />
  </UtilityModulePage>;
}
