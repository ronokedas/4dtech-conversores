"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { tools } from "@/lib/tools";
import { Logo } from "./Logo";
import { ToolIcon } from "./ToolIcon";

const groups = [
  { title: "PDF", tools: tools.filter((tool) => tool.category === "pdf") },
  { title: "Imagem", tools: tools.filter((tool) => tool.category === "imagem") },
  { title: "Áudio", tools: tools.filter((tool) => tool.category === "audio") },
  { title: "Conversores", tools: tools.filter((tool) => tool.category === "conversores") },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-inner"><Logo />
    <button className="menu-button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
    <nav aria-label="Navegação principal" className={open ? "nav open" : "nav"}>
      <div className="nav-tools">
        <Link href="/ferramentas" onClick={() => setOpen(false)}>Ferramentas <ChevronDown size={15} /></Link>
        <div className="mega-menu" aria-label="Ferramentas disponíveis">
          <div className="mega-columns">
            {groups.map((group) => <div key={group.title}>
              <strong>{group.title}</strong>
              {group.tools.map((tool) => <Link href={tool.href} key={tool.slug} onClick={() => setOpen(false)}>
                <ToolIcon tool={tool} compact />
                <span>{tool.shortTitle}<small>{tool.status === "available" ? "Disponível" : "Em breve"}</small></span>
              </Link>)}
            </div>)}
          </div>
          <Link className="mega-all" href="/ferramentas" onClick={() => setOpen(false)}>Ver todas as ferramentas <ArrowRight size={16} /></Link>
        </div>
      </div>
      <Link href="/ferramentas#pdf" onClick={() => setOpen(false)}>PDF <ChevronDown size={15} /></Link>
      <Link href="/ferramentas#imagem" onClick={() => setOpen(false)}>Imagem <ChevronDown size={15} /></Link>
      <Link href="/transcrever-audio-em-texto" onClick={() => setOpen(false)}>Áudio</Link>
      <Link href="/como-funciona" onClick={() => setOpen(false)}>Como funciona</Link>
      <Link href="/duvidas" onClick={() => setOpen(false)}>Dúvidas</Link>
      <Link className="nav-cta" href="/ferramentas" onClick={() => setOpen(false)}>Começar agora</Link>
    </nav>
  </div></header>;
}
