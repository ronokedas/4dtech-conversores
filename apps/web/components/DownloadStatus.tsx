"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, FileImage, FileText, Mic, QrCode, RefreshCw, TriangleAlert } from "lucide-react";
import { AdSlot } from "./AdSlot";

type Status = { status: "queued" | "processing" | "ready" | "failed" | "expired"; filename?: string; size?: number; mimeType?: string; tool?: string; error?: string };
const formatSize = (bytes?: number) => bytes ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(bytes / 1024 / 1024) + " MB" : "";

export function DownloadStatus({ token }: { token: string }) {
  const [data, setData] = useState<Status>({ status: "queued" });
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";
  const isBackground = data.tool === "background";
  const isQrCode = data.tool === "qr-code";
  const isImageTool = data.tool === "compress-image" || data.tool === "resize-image" || data.tool === "convert-image";
  const isVideoMp3 = data.tool === "video-mp3" || data.mimeType === "audio/mpeg";
  const isImage = isBackground || isQrCode || isImageTool || data.mimeType?.startsWith("image/");
  const isZip = data.tool === "pdf-jpg" || data.mimeType === "application/zip";
  const isText = data.tool === "audio-text" || data.mimeType?.startsWith("text/plain");
  const isWord = data.tool === "word";
  const isExcel = data.tool === "excel";
  const isPdfWord = data.tool === "pdf-word";
  const isPdfExcel = data.tool === "pdf-excel";
  const isEditPdf = data.tool === "edit-pdf";
  const toolRoute: Record<string, string> = {
    background: "/remover-fundo-de-imagem",
    word: "/word-para-pdf",
    excel: "/excel-para-pdf",
    "pdf-word": "/pdf-para-word",
    "pdf-excel": "/pdf-para-excel",
    "edit-pdf": "/editar-pdf",
    "compress-pdf": "/comprimir-pdf",
    "merge-pdf": "/juntar-pdf",
    "split-pdf": "/dividir-pdf",
    "image-pdf": "/imagem-para-pdf",
    "pdf-jpg": "/pdf-para-jpg",
    "sign-pdf": "/assinar-pdf",
    "protect-pdf": "/proteger-pdf",
    "unlock-pdf": "/remover-senha-pdf",
    "organize-pdf": "/organizar-pdf",
    "audio-text": "/transcrever-audio-em-texto",
    "qr-code": "/qr-code",
    "txt-pdf": "/txt-para-pdf",
    "markdown-pdf": "/markdown-para-pdf",
    "compress-image": "/comprimir-imagem",
    "resize-image": "/redimensionar-imagem",
    "convert-image": "/converter-imagem",
    "video-mp3": "/video-para-mp3",
  };
  const anotherHref = data.tool ? toolRoute[data.tool] || "/html-para-pdf" : "/html-para-pdf";
  const copy = useMemo(() => {
    let processingTitle = "Estamos preparando seu arquivo";
    let processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Processando arquivo...";
    let successTitle = "Seu PDF está pronto";
    let downloadText = "Baixar PDF";
    let anotherText = "Usar novamente";
    let helpText = "Confira se o arquivo ficou como esperado. Se precisar, volte ao módulo e gere uma nova versão.";

    if (isQrCode) {
      processingTitle = "Estamos gerando seu QR Code";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Criando a imagem PNG...";
      successTitle = "Seu QR Code está pronto";
      downloadText = "Baixar PNG";
      anotherText = "Gerar outro QR Code";
      helpText = "Teste o QR Code com a câmera do celular antes de imprimir ou compartilhar em grande escala.";
    } else if (isBackground) {
      processingTitle = "Estamos removendo o fundo";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Processando a imagem...";
      successTitle = "Sua imagem está pronta";
      downloadText = "Baixar PNG transparente";
      anotherText = "Remover outro fundo";
      helpText = "Use o PNG transparente em lojas virtuais, apresentações, redes sociais ou materiais de marketing.";
    } else if (isImageTool) {
      processingTitle = "Estamos processando sua imagem";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Otimizando a imagem...";
      successTitle = "Sua imagem está pronta";
      downloadText = data.mimeType === "image/webp" ? "Baixar WebP" : data.mimeType === "image/jpeg" ? "Baixar JPG" : "Baixar PNG";
      anotherText = "Processar outra imagem";
      helpText = "Abra a imagem final e confira dimensões, qualidade e formato antes de publicar em sites, redes sociais ou materiais.";
    } else if (isWord) {
      processingTitle = "Estamos convertendo seu Word";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Convertendo o documento...";
      anotherText = "Converter outro Word";
      helpText = "Confira se textos, imagens e quebras de página aparecem como esperado no PDF final.";
    } else if (isExcel) {
      processingTitle = "Estamos convertendo seu Excel";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Convertendo a planilha...";
      anotherText = "Converter outro Excel";
      helpText = "Confira se as colunas e páginas ficaram legíveis. Se precisar, gere uma nova versão em outra orientação.";
    } else if (isPdfWord) {
      processingTitle = "Estamos convertendo seu PDF";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Criando o arquivo Word...";
      successTitle = "Seu Word está pronto";
      downloadText = "Baixar Word";
      anotherText = "Converter outro PDF";
      helpText = "Abra o DOCX e confira se textos e imagens ficaram editáveis. PDFs escaneados podem precisar de OCR em uma etapa futura.";
    } else if (isPdfExcel) {
      processingTitle = "Estamos extraindo os dados";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Montando a planilha...";
      successTitle = "Seu Excel está pronto";
      downloadText = "Baixar Excel";
      anotherText = "Converter outro PDF";
      helpText = "Abra o XLSX e confira as colunas. PDFs escaneados ou tabelas muito visuais podem precisar de OCR em uma etapa futura.";
    } else if (isEditPdf) {
      processingTitle = "Estamos editando seu PDF";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Aplicando o texto...";
      helpText = "Abra o PDF editado e confira se o texto apareceu na página e posição escolhidas.";
    } else if (isZip) {
      processingTitle = "Estamos criando suas imagens";
      successTitle = "Suas imagens estão prontas";
      downloadText = "Baixar ZIP";
      helpText = "Descompacte o ZIP para acessar as imagens JPG geradas a partir das páginas do PDF.";
    } else if (isText) {
      processingTitle = "Estamos transcrevendo seu áudio";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Convertendo fala em texto...";
      successTitle = "Sua transcrição está pronta";
      downloadText = "Baixar TXT";
      anotherText = "Transcrever outro áudio";
      helpText = "Abra o TXT, revise nomes próprios e pontuação, e copie o texto para seu documento final.";
    } else if (isVideoMp3) {
      processingTitle = "Estamos extraindo o áudio";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Convertendo vídeo para MP3...";
      successTitle = "Seu MP3 está pronto";
      downloadText = "Baixar MP3";
      anotherText = "Converter outro vídeo";
      helpText = "Ouça o MP3 para conferir volume e duração. Vídeos sem áudio não geram um resultado útil.";
    }

    return {
      processingTitle,
      processingText: isBackground ? "Isso pode levar alguns segundos na primeira imagem. Não feche esta página." : "Isso normalmente leva apenas alguns segundos. Não feche esta página.",
      processingSmall,
      successTitle,
      downloadText,
      anotherText,
      anotherHref,
      helpTitle: "Depois de baixar",
      helpText,
    };
  }, [anotherHref, data.mimeType, data.status, isBackground, isQrCode, isImageTool, isWord, isExcel, isPdfWord, isPdfExcel, isEditPdf, isZip, isText, isVideoMp3]);

  useEffect(() => {
    let active = true; let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const response = await fetch(`${apiBase}/conversions/${token}/status`, { cache: "no-store" });
        const next = await response.json() as Status;
        if (!active) return; setData(next);
        if (["queued", "processing"].includes(next.status)) timer = setTimeout(poll, 1500);
      } catch { if (active) timer = setTimeout(poll, 2500); }
    }
    poll(); return () => { active = false; clearTimeout(timer); };
  }, [apiBase, token]);

  if (["queued", "processing"].includes(data.status)) return <section className="download-state" aria-live="polite"><div className="status-icon processing"><span className="spinner large" /></div><h1>{copy.processingTitle}</h1><p>{copy.processingText}</p><div className="progress"><span /></div><small>{copy.processingSmall}</small></section>;
  if (data.status === "failed" || data.status === "expired") return <section className="download-state" aria-live="assertive"><div className="status-icon error"><TriangleAlert /></div><h1>{data.status === "expired" ? "Este arquivo expirou" : "Não foi possível processar"}</h1><p>{data.error || "O arquivo não está mais disponível. Faça uma nova tentativa."}</p><Link href={anotherHref} className="button primary"><RefreshCw size={18}/> Tentar novamente</Link></section>;
  const Icon = isText || isVideoMp3 ? Mic : (isQrCode ? QrCode : (isImage || isZip ? FileImage : FileText));
  return <><section className="download-state success" aria-live="polite"><div className="status-icon success"><Check /></div><h1>{copy.successTitle}</h1><p>O arquivo será apagado do servidor depois que o download terminar.</p><div className="file-row"><Icon aria-hidden="true"/><div><strong>{data.filename}</strong><span>{formatSize(data.size)}</span></div></div><a className="button primary download-button" href={`${apiBase}/conversions/${token}/download`}><Download size={19}/> {copy.downloadText}</a><Link className="button secondary" href={copy.anotherHref}><RefreshCw size={17}/> {copy.anotherText}</Link></section><div className="download-ad-separator"><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT}/></div><section className="download-help"><h2>{copy.helpTitle}</h2><p>{copy.helpText}</p><Link href="/ferramentas">Ver outras ferramentas</Link></section></>;
}
