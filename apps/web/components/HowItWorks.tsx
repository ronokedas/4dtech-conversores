import { ArrowRight, Download, FileUp, LoaderCircle } from "lucide-react";
const steps = [
  { icon: FileUp, title: "Envie ou cole a URL", text: "Envie um arquivo HTML/ZIP ou cole o endereço da página." },
  { icon: LoaderCircle, title: "Nós convertemos", text: "Nossa ferramenta gera seu PDF com rapidez e segurança." },
  { icon: Download, title: "Baixe seu PDF", text: "Seu PDF fica pronto para você baixar e usar." },
];
export function HowItWorks() { return <section className="how" aria-labelledby="how-title"><h2 id="how-title">Como funciona</h2><div className="steps">{steps.map((step, index) => <div className="step" key={step.title}><span className="step-number">{index + 1}</span><step.icon className="step-icon" aria-hidden="true"/><div><h3>{step.title}</h3><p>{step.text}</p></div>{index < 2 ? <ArrowRight className="step-arrow" aria-hidden="true" /> : null}</div>)}</div></section>; }
