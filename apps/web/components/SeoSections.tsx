type SeoSectionsProps = {
  intro?: {
    title: string;
    body: string;
  };
  howTo: string[];
  privacy: string;
  tips: string[];
};

export function SeoSections({ intro, howTo, privacy, tips }: SeoSectionsProps) {
  return <section className="seo-sections" aria-label="Informações da ferramenta">
    {intro ? <div className="seo-intro">
      <h2>{intro.title}</h2>
      <p>{intro.body}</p>
    </div> : null}
    <div className="seo-card">
      <h2>Como usar</h2>
      <ol>
        {howTo.map((item) => <li key={item}>{item}</li>)}
      </ol>
    </div>
    <div className="seo-card">
      <h2>Privacidade</h2>
      <p>{privacy}</p>
    </div>
    <div className="seo-card">
      <h2>Dicas para um resultado melhor</h2>
      <ul>
        {tips.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  </section>;
}
