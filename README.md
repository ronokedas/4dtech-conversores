# HTML em PDF

Conversor publico de arquivos HTML/ZIP e URLs para PDF, com Next.js, Fastify, Redis, Playwright e Docker Compose.

## Executar no Windows 10

1. Copie `.env.example` para `.env`.
2. Execute `docker compose up --build`.
3. Abra `http://localhost:8090`.

Turnstile, AdSense e Analytics ficam desativados quando suas chaves estão vazias. Em produção, o domínio canônico é `https://www.4dtech.com.br`; o domínio sem `www` é redirecionado permanentemente. Aponte os dois registros DNS para a VPS e use também o arquivo de produção.

## Estrutura

- `apps/web`: interface, páginas editoriais e SEO.
- `apps/service`: API, fila e worker Chromium.
- `/data/jobs`: volume temporário apagado após download ou em uma hora.

Consulte `DEPLOY.md` para publicação e operação.
