import Link from "next/link";
export default function NotFound() { return <div className="container empty-page"><h1>Página não encontrada</h1><p>O endereço pode estar incorreto ou o arquivo já expirou.</p><Link href="/" className="button primary">Voltar ao conversor</Link></div>; }
