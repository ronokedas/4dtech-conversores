import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function ContentPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) { return <article className="content-page container"><nav className="breadcrumb" aria-label="Navegação estrutural"><Link href="/">Início</Link><ChevronRight/><span>{title}</span></nav><header><h1>{title}</h1><p>{intro}</p></header><div className="prose">{children}</div></article>; }
