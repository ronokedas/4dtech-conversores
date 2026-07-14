import { ArrowRight, Download, FileUp, LoaderCircle } from "lucide-react";
const steps = [
  { icon: FileUp, title: "Escolha uma ferramenta", text: "Abra o módulo desejado: PDF, imagem, Word, Excel ou HTML para PDF." },
  { icon: LoaderCircle, title: "Envie e aguarde", text: "Carregue o arquivo ou informe a URL. O processamento acontece em uma fila temporária." },
  { icon: Download, title: "Baixe o resultado", text: "Quando ficar pronto, baixe o arquivo final. Depois do download, ele é removido automaticamente." },
];
export function HowItWorks() { return <section className="how" aria-labelledby="how-title"><h2 id="how-title">Como funciona</h2><div className="steps">{steps.map((step, index) => <div className="step" key={step.title}><span className="step-number">{index + 1}</span><step.icon className="step-icon" aria-hidden="true"/><div><h3>{step.title}</h3><p>{step.text}</p></div>{index < 2 ? <ArrowRight className="step-arrow" aria-hidden="true" /> : null}</div>)}</div></section>; }
