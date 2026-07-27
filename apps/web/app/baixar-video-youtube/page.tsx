import type { Metadata } from "next";
import { SeoSections } from "@/components/SeoSections";
import { ToolIcon } from "@/components/ToolIcon";
import { YoutubeDownloader } from "@/components/YoutubeDownloader";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("baixar-video-youtube")!;
export const metadata: Metadata = { title: "Baixar vídeo do YouTube em MP4", description: "Baixe vídeos públicos e Shorts do YouTube em MP4, até 1080p, para conteúdos que você tem autorização de salvar.", alternates: { canonical: tool.href } };

export default function Page() {
  return <article className="container tool-page"><nav className="breadcrumb" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>{tool.title}</span></nav><div className="tool-layout"><div><header className="tool-header"><ToolIcon tool={tool} /><div><h1>{tool.title}</h1><p>{tool.longDescription}</p></div></header><YoutubeDownloader /><SeoSections intro={{ title: "Salve vídeos autorizados em MP4", body: "Cole um link de vídeo ou Short público do YouTube e escolha a qualidade máxima. Use esta ferramenta apenas para conteúdos seus ou que você tem permissão para baixar." }} howTo={["Cole o link de um vídeo ou Short público do YouTube.", "Escolha a qualidade máxima entre 360p, 720p e 1080p.", "Confirme que você possui autorização e inicie o processamento.", "Baixe o MP4 quando ele estiver pronto."]} privacy="O arquivo é temporário e removido automaticamente após o download ou expiração." tips={["O limite por vídeo é de 30 minutos e 500 MB.", "Se a qualidade escolhida não existir, será usada a melhor opção menor disponível.", "Playlists, canais, lives e vídeos privados não são aceitos.", "Respeite direitos autorais e os termos de uso da plataforma."]} /></div><RelatedTools activeSlug={tool.slug} /></div></article>;
}
