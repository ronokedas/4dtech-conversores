const faqs = [
  ["Quais ferramentas estão disponíveis?", "Você pode transcrever áudio em texto, converter HTML/URL para PDF, remover fundo de imagem, converter Word e Excel para PDF, transformar PDF em Word/Excel/JPG, editar, assinar, proteger, comprimir, juntar, dividir e organizar PDFs."],
  ["Preciso criar conta para usar?", "Não. O serviço é gratuito, online e sem cadastro. Você escolhe a ferramenta, envia o arquivo e baixa o resultado quando estiver pronto."],
  ["O que acontece com meus arquivos?", "Eles são usados somente durante o processamento e apagados depois que o download termina. Se você não baixar, a limpeza automática acontece em até uma hora."],
  ["Existe limite de tamanho?", "Sim. Em geral, documentos podem ter até 25 MB por envio. Imagens para remoção de fundo têm limite de 15 MB. PDFs finais muito grandes podem ser recusados para manter o serviço estável."],
  ["Os arquivos ficam salvos no site?", "Não. O site não cria histórico, não tem área de login e não mantém biblioteca de arquivos. Cada trabalho é temporário e ligado a um token de download."],
  ["O link de download pode ser usado várias vezes?", "Não. O download é de uso único. Depois que a transferência termina, o arquivo é removido do servidor."],
  ["Posso converter páginas ou arquivos com senha?", "Páginas por URL precisam ser públicas e sem login. PDFs protegidos podem ser desbloqueados apenas quando você informa a senha correta no módulo Remover senha de PDF."],
  ["O resultado fica exatamente igual ao original?", "A ferramenta tenta preservar ao máximo o conteúdo, mas o resultado pode variar conforme fontes, imagens, tabelas, páginas escaneadas e estrutura do arquivo enviado."],
];
export function Faq({ full = false }: { full?: boolean }) { const list = full ? faqs : faqs.slice(0, 4); return <section className="faq" aria-labelledby="faq-title"><h2 id="faq-title">Dúvidas frequentes</h2><div>{list.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>; }
