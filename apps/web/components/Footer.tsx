import Link from "next/link";
import { tools } from "@/lib/tools";
import { Logo } from "./Logo";

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><Logo /><nav aria-label="Rodape">
    <Link href="/ferramentas">Ferramentas</Link>
    {tools.slice(0, 4).map((tool) => <Link key={tool.slug} href={tool.href}>{tool.shortTitle}</Link>)}
    <Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link>
  </nav><p>© {new Date().getFullYear()} Documentos Online - 4D Tech. Todos os direitos reservados.</p></div></footer>;
}
