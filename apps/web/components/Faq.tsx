const faqs = [
  ["Quais tipos de arquivo posso enviar?", "Você pode enviar HTML, HTM ou um ZIP com o HTML e seus arquivos de CSS, imagens e fontes. O ZIP deve ter um index.html ou apenas um arquivo HTML."],
  ["O que acontece com meus arquivos?", "Eles são usados somente durante a conversão e apagados depois que o download termina. Se você não baixar, a limpeza automática acontece em até uma hora."],
  ["Existe limite de tamanho?", "Sim. O upload pode ter até 25 MB e o conteúdo de um ZIP, depois de extraído, até 100 MB."],
  ["A conversão preserva o layout e os estilos?", "O PDF é produzido pelo Chromium, o mesmo motor de navegador usado pelo Chrome. CSS, imagens e fontes acessíveis normalmente são preservados."],
  ["Posso converter páginas protegidas por senha?", "Não. Por segurança e privacidade, a versão atual converte apenas páginas públicas sem login."],
];
export function Faq({ full = false }: { full?: boolean }) { const list = full ? faqs : faqs.slice(0, 4); return <section className="faq" aria-labelledby="faq-title"><h2 id="faq-title">Dúvidas frequentes</h2><div>{list.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>; }
