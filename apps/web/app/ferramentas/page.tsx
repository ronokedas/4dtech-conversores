import type { Metadata } from "next";
import { ToolsGrid } from "@/components/ToolsGrid";

export const metadata: Metadata = {
  title: "Todas as ferramentas",
  description: "Veja todas as ferramentas do Documentos Online - 4D Tech para PDF, documentos e imagens.",
  alternates: { canonical: "/ferramentas" },
};

export default function Page() {
  return <article className="container tools-page">
    <header className="tools-page-header"><h1>Todas as ferramentas online</h1><p>Escolha o módulo certo para converter documentos, trabalhar com PDF ou remover fundo de imagem.</p></header>
    <ToolsGrid title="Ferramentas disponíveis e em breve" />
  </article>;
}
