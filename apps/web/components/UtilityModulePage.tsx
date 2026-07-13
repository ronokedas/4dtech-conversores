import type { ToolDefinition } from "@/lib/tools";
import { RelatedTools } from "./RelatedTools";
import { ToolIcon } from "./ToolIcon";
import { PdfUtilityUploader, type UtilityField } from "./PdfUtilityUploader";

type Props = {
  tool: ToolDefinition;
  endpoint: string;
  accept: string;
  allowedExtensions: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxMb?: number;
  uploadTitle: string;
  idleHint: string;
  selectedHint?: string;
  smallHint: string;
  buttonText: string;
  busyText: string;
  privacyText: string;
  icon?: "pdf" | "image";
  fields?: UtilityField[];
  children: React.ReactNode;
};

export function UtilityModulePage({ tool, children, uploadTitle, ...uploader }: Props) {
  return <article className="container tool-page">
    <nav className="breadcrumb" aria-label="Navegacao estrutural"><a href="/">Inicio</a><span>›</span><a href="/ferramentas">Ferramentas</a><span>›</span><span>{tool.title}</span></nav>
    <div className="tool-layout">
      <div>
        <header className="tool-header">
          <ToolIcon tool={tool} />
          <div><h1>{tool.title}</h1><p>{tool.longDescription}</p></div>
        </header>
        <PdfUtilityUploader {...uploader} title={uploadTitle} />
        {children}
      </div>
      <RelatedTools activeSlug={tool.slug} />
    </div>
  </article>;
}
