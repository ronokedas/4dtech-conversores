"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Download, FileImage, FileText, RefreshCw, TriangleAlert } from "lucide-react";
import { AdSlot } from "./AdSlot";

type Status = { status: "queued" | "processing" | "ready" | "failed" | "expired"; filename?: string; size?: number; mimeType?: string; tool?: string; error?: string };
const formatSize = (bytes?: number) => bytes ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(bytes / 1024 / 1024) + " MB" : "";

export function DownloadStatus({ token }: { token: string }) {
  const [data, setData] = useState<Status>({ status: "queued" });
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";
  const isImage = data.tool === "background" || data.mimeType === "image/png";
  const isZip = data.tool === "pdf-jpg" || data.mimeType === "application/zip";
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
  };
  const anotherHref = data.tool ? toolRoute[data.tool] || "/html-para-pdf" : "/html-para-pdf";
  const copy = useMemo(() => {
    let processingTitle = "Estamos preparando seu arquivo";
    let processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Processando arquivo...";
    let successTitle = "Seu PDF esta pronto";
    let downloadText = "Baixar PDF";
    let anotherText = "Usar novamente";
    let helpText = "Confira se o arquivo ficou como esperado. Se precisar, volte ao modulo e gere uma nova versao.";

    if (isImage) {
      processingTitle = "Estamos removendo o fundo";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Processando a imagem...";
      successTitle = "Sua imagem esta pronta";
      downloadText = "Baixar PNG transparente";
      anotherText = "Remover outro fundo";
      helpText = "Use o PNG transparente em lojas virtuais, apresentacoes, redes sociais ou materiais de marketing.";
    } else if (isWord) {
      processingTitle = "Estamos convertendo seu Word";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Convertendo o documento...";
      anotherText = "Converter outro Word";
      helpText = "Confira se textos, imagens e quebras de pagina aparecem como esperado no PDF final.";
    } else if (isExcel) {
      processingTitle = "Estamos convertendo seu Excel";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Convertendo a planilha...";
      anotherText = "Converter outro Excel";
      helpText = "Confira se as colunas e paginas ficaram legiveis. Se precisar, gere uma nova versao em outra orientacao.";
    } else if (isPdfWord) {
      processingTitle = "Estamos convertendo seu PDF";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Criando o arquivo Word...";
      successTitle = "Seu Word esta pronto";
      downloadText = "Baixar Word";
      anotherText = "Converter outro PDF";
      helpText = "Abra o DOCX e confira se textos e imagens ficaram editaveis. PDFs escaneados podem precisar de OCR em uma etapa futura.";
    } else if (isPdfExcel) {
      processingTitle = "Estamos extraindo os dados";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Montando a planilha...";
      successTitle = "Seu Excel esta pronto";
      downloadText = "Baixar Excel";
      anotherText = "Converter outro PDF";
      helpText = "Abra o XLSX e confira as colunas. PDFs escaneados ou tabelas muito visuais podem precisar de OCR em uma etapa futura.";
    } else if (isEditPdf) {
      processingTitle = "Estamos editando seu PDF";
      processingSmall = data.status === "queued" ? "Aguardando processamento..." : "Aplicando o texto...";
      helpText = "Abra o PDF editado e confira se o texto apareceu na pagina e posicao escolhidas.";
    } else if (isZip) {
      processingTitle = "Estamos criando suas imagens";
      successTitle = "Suas imagens estao prontas";
      downloadText = "Baixar ZIP";
      helpText = "Descompacte o ZIP para acessar as imagens JPG geradas a partir das paginas do PDF.";
    }

    return {
      processingTitle,
      processingText: isImage ? "Isso pode levar alguns segundos na primeira imagem. Nao feche esta pagina." : "Isso normalmente leva apenas alguns segundos. Nao feche esta pagina.",
      processingSmall,
      successTitle,
      downloadText,
      anotherText,
      anotherHref,
      helpTitle: "Depois de baixar",
      helpText,
    };
  }, [anotherHref, data.status, isImage, isWord, isExcel, isPdfWord, isPdfExcel, isEditPdf, isZip]);

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
  if (data.status === "failed" || data.status === "expired") return <section className="download-state" aria-live="assertive"><div className="status-icon error"><TriangleAlert /></div><h1>{data.status === "expired" ? "Este arquivo expirou" : "Nao foi possivel processar"}</h1><p>{data.error || "O arquivo nao esta mais disponivel. Faca uma nova tentativa."}</p><Link href={anotherHref} className="button primary"><RefreshCw size={18}/> Tentar novamente</Link></section>;
  const Icon = isImage || isZip ? FileImage : FileText;
  return <><section className="download-state success" aria-live="polite"><div className="status-icon success"><Check /></div><h1>{copy.successTitle}</h1><p>O arquivo sera apagado do servidor depois que o download terminar.</p><div className="file-row"><Icon aria-hidden="true"/><div><strong>{data.filename}</strong><span>{formatSize(data.size)}</span></div></div><a className="button primary download-button" href={`${apiBase}/conversions/${token}/download`}><Download size={19}/> {copy.downloadText}</a><Link className="button secondary" href={copy.anotherHref}><RefreshCw size={17}/> {copy.anotherText}</Link></section><div className="download-ad-separator"><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT}/></div><section className="download-help"><h2>{copy.helpTitle}</h2><p>{copy.helpText}</p><Link href="/ferramentas">Ver outras ferramentas</Link></section></>;
}
