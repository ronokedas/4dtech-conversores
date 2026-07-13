import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/ContentPage";

const guides = {
  "html-para-pdf": {
    title: "Como converter HTML para PDF",
    description: "Aprenda a preparar e converter um arquivo HTML em PDF sem perder estilos, imagens e quebras de página.",
    sections: [
      ["Prepare o arquivo principal", "Confirme que o HTML abre corretamente no navegador. Se ele depender apenas de recursos públicos, você pode enviá-lo sozinho. Para recursos locais, prefira um ZIP."],
      ["Organize os recursos", "Mantenha CSS, imagens e fontes em pastas com caminhos relativos. No pacote ZIP, use index.html como entrada principal para evitar ambiguidades."],
      ["Escolha o formato", "A4 com margens normais funciona para a maioria dos documentos. Use paisagem quando houver tabelas largas ou layouts horizontais."],
      ["Revise o resultado", "Depois do download, confira fontes, imagens, cores e quebras. Ajustes em regras CSS de impressão podem melhorar documentos mais complexos."],
    ],
  },
  "converter-url-em-pdf": {
    title: "Como converter uma URL em PDF",
    description: "Transforme uma página pública da internet em PDF informando apenas seu endereço completo.",
    sections: [
      ["Use o endereço completo", "Copie a URL iniciada por https:// ou http://. Por segurança, o conversor aceita apenas páginas públicas nas portas comuns da web."],
      ["Aguarde o carregamento", "O serviço abre a página em um navegador isolado e aguarda o conteúdo principal. Sites muito lentos ou que exigem login não podem ser convertidos."],
      ["Conteúdo dinâmico", "Aplicações com JavaScript normalmente funcionam, desde que os dados estejam disponíveis sem autenticação e sejam carregados dentro do tempo de conversão."],
      ["Privacidade", "Não envie URLs com segredos em parâmetros. O serviço não oferece cookies de login nem acesso a painéis privados."],
    ],
  },
  "preservar-css-imagens-e-fontes": {
    title: "Como preservar CSS, imagens e fontes no PDF",
    description: "Boas práticas para manter a aparência da página HTML durante a conversão para PDF.",
    sections: [
      ["Prefira caminhos relativos", "Em um ZIP, referencie arquivos como ./css/estilo.css e ./imagens/capa.jpg. Caminhos absolutos do seu computador não existem dentro do conversor."],
      ["Inclua as fontes", "Use formatos WOFF2 ou WOFF e declare as fontes com @font-face. Recursos externos precisam estar públicos e aceitar carregamento pela página."],
      ["Crie estilos de impressão", "Use @media print para esconder menus e ajustar cores. A regra @page pode definir detalhes de impressão, embora o formato escolhido no conversor tenha prioridade."],
      ["Evite alturas rígidas", "Blocos com altura fixa podem cortar conteúdo. Para documentos longos, permita fluxo natural e use break-inside ou break-before com moderação."],
    ],
  },
  "corrigir-erros-na-conversao": {
    title: "Como corrigir erros na conversão",
    description: "Soluções para imagens ausentes, ZIP inválido, página inacessível e diferenças no PDF.",
    sections: [
      ["O ZIP não foi aceito", "Confirme que há um index.html, que o pacote não ultrapassa os limites e que não contém executáveis, links simbólicos ou caminhos para fora da pasta."],
      ["Imagens não aparecem", "Abra o HTML fora do editor e verifique os caminhos. Inclua os arquivos no ZIP e respeite letras maiúsculas e minúsculas nos nomes."],
      ["A URL não abre", "A página precisa ser pública, usar HTTP ou HTTPS e não depender de login. Endereços locais e redes privadas são bloqueados."],
      ["O layout ficou diferente", "Remova estilos específicos de tela que conflitem com impressão, carregue fontes antes de renderizar e evite componentes que dependam de interação para aparecer."],
    ],
  },
} as const;

type Slug = keyof typeof guides;
export function generateStaticParams() { return Object.keys(guides).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = guides[slug as Slug]; return guide ? { title: guide.title, description: guide.description, alternates: { canonical: `/guias/${slug}` } } : {}; }
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const guide = guides[slug as Slug]; if (!guide) notFound(); return <ContentPage title={guide.title} intro={guide.description}>{guide.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}</ContentPage>; }
