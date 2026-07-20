import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConsentBanner } from "@/components/ConsentBanner";
import { AdSlot } from "@/components/AdSlot";
import { getPublicOrigin } from "@/lib/site";

const origin = getPublicOrigin();
const brand = "Documentos Online - 4D Tech";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: `${brand} | Ferramentas online para documentos e imagens`, template: `%s | ${brand}` },
  description: "Ferramentas online para converter HTML em PDF, transcrever áudio, remover fundo de imagem e acessar módulos para Word, Excel e PDF.",
  applicationName: brand,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_BR", siteName: brand, title: "Ferramentas online para documentos e imagens", description: "Converta documentos, transcreva áudio, trabalhe com PDF e remova fundo de imagem online." },
  twitter: { card: "summary", title: brand, description: "Ferramentas online para documentos, áudio, PDF e imagens." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff", colorScheme: "light" };

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${origin}/#organization`, name: brand, url: origin },
    { "@type": "WebSite", "@id": `${origin}/#website`, url: origin, name: brand, inLanguage: "pt-BR", publisher: { "@id": `${origin}/#organization` } },
    { "@type": "SoftwareApplication", name: brand, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", url: origin, offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" } },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return <html lang="pt-BR">
    <head>
      <Script id="schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {adsClient ? <Script id="adsense-script" strategy="afterInteractive" data-ad-client={adsClient} src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`} crossOrigin="anonymous" /> : null}
    </head>
    <body><Header /><main>{children}</main><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} className="container global-ad" /><Footer /><ConsentBanner /></body>
  </html>;
}
