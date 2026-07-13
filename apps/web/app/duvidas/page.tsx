import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { Faq } from "@/components/Faq";
export const metadata: Metadata = { title: "Dúvidas frequentes", description: "Respostas sobre formatos, limites, privacidade e qualidade da conversão HTML para PDF." };
export default function Page() { return <ContentPage title="Dúvidas frequentes" intro="Encontre respostas rápidas sobre arquivos aceitos, limites e segurança."><Faq full/><h2>Ainda não funcionou?</h2><p>Verifique se o ZIP possui um <code>index.html</code>, se os caminhos das imagens são relativos e se recursos externos estão disponíveis publicamente.</p></ContentPage>; }
