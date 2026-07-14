import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/tools";
import { UtilityModulePage } from "@/components/UtilityModulePage";

const tool = getToolBySlug("transcrever-audio-em-texto")!;
export const metadata: Metadata = { title: tool.seoTitle, description: tool.seoDescription, alternates: { canonical: tool.href } };

export default function Page() {
  return <UtilityModulePage tool={tool} endpoint="audio-text" accept=".mp3,.wav,.m4a,.ogg,.webm,.mp4,audio/*,video/mp4,video/webm" allowedExtensions={["mp3", "wav", "m4a", "ogg", "webm", "mp4", "mpeg", "mpga"]} maxMb={50} uploadTitle="Arraste seu áudio aqui" idleHint="escolha um áudio ou vídeo" smallHint="MP3, WAV, M4A, OGG, WEBM ou MP4 até 50 MB" buttonText="Transcrever áudio" busyText="Enviando para transcrição..." privacyText="O arquivo original e a transcrição são temporários e expiram automaticamente." icon="audio" fields={[{ name: "language", label: "Idioma", type: "select", defaultValue: "pt", options: [{ value: "pt", label: "Português" }, { value: "en", label: "Inglês" }, { value: "es", label: "Espanhol" }, { value: "auto", label: "Detectar automaticamente" }] }]}>
    <section className="tool-content"><div><h2>Como transcrever áudio em texto</h2><p>Envie um áudio ou vídeo curto, escolha o idioma principal e aguarde a transcrição. O resultado sai em TXT para copiar, revisar ou transformar em documento.</p></div><div><h2>Quando usar</h2><ul><li>Áudios de WhatsApp e gravações rápidas.</li><li>Entrevistas, reuniões e aulas curtas.</li><li>Anotações faladas que precisam virar texto.</li><li>Vídeos curtos com fala clara.</li></ul></div></section>
    <section className="tool-content"><div><h2>Limites recomendados</h2><p>Para manter o serviço leve em VPS pequena, use arquivos de até 50 MB e, de preferência, áudios de até 10 minutos. Arquivos longos podem demorar mais.</p></div><div><h2>Privacidade</h2><p>A transcrição é processada em fila temporária. Depois que você baixa o TXT, o arquivo é removido do servidor.</p></div></section>
  </UtilityModulePage>;
}
