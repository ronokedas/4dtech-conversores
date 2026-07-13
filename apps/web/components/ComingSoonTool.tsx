import { Clock, MailCheck } from "lucide-react";

export function ComingSoonTool({ title }: { title: string }) {
  return <section className="soon-tool" aria-label={`${title} em breve`}>
    <div className="status-icon processing"><Clock /></div>
    <h2>Servico em breve</h2>
    <p>Estamos preparando este modulo para funcionar direto no navegador com a mesma simplicidade das ferramentas ja disponiveis.</p>
    <div className="soon-box"><MailCheck aria-hidden="true" /><span>{title} ficara disponivel nesta pagina assim que o processamento estiver pronto.</span></div>
  </section>;
}
