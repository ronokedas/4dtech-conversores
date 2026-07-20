# Checklist de publicação — Documentos Online - 4D Tech

Use este checklist antes de colocar o site no ar e antes de enviar para Search Console/AdSense.

## 1. `.env` e `.env.example`

- [ ] O arquivo `.env.example` está no GitHub.
- [ ] O arquivo `.env` real não está no GitHub.
- [ ] Na VPS, o `.env` foi criado com `cp .env.example .env`.
- [ ] `SITE_ADDRESS` usa seu domínio real.
- [ ] `PUBLIC_ORIGIN` usa HTTPS e o domínio principal.
- [ ] `HOST_PORT=80`.
- [ ] `HTTPS_PORT=443`.
- [ ] `HTTPS_UDP_PORT=443`.
- [ ] `NEXT_PUBLIC_API_BASE=/api`.
- [ ] `ACME_EMAIL` contém um e-mail real.
- [ ] Turnstile está vazio apenas em teste local.
- [ ] Em produção, `TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` foram preenchidos.
- [ ] AdSense está vazio até o site ser aprovado.

Exemplo de produção:

```env
SITE_ADDRESS=www.4dtech.com.br
REDIRECT_SITE_ADDRESS=4dtech.com.br
PUBLIC_ORIGIN=https://www.4dtech.com.br
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
NEXT_PUBLIC_API_BASE=/api
ACME_EMAIL=contato@4dtech.com.br
```

## 2. Manual

- [ ] Ler `MANUAL_INSTALACAO_PUBLICACAO.md`.
- [ ] Confirmar que o repositório usado na VPS é o correto.
- [ ] Confirmar que o comando de produção usa:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- [ ] Confirmar que o backup não inclui arquivos enviados pelos usuários.
- [ ] Confirmar que `.env` foi guardado fora do GitHub.

## 3. Cloudflare e domínio

- [ ] Domínio adicionado na Cloudflare.
- [ ] Nameservers do domínio apontam para a Cloudflare.
- [ ] Registro `A` do domínio principal aponta para o IP da VPS.
- [ ] Registro `www` criado como `CNAME` para `4dtech.com.br`.
- [ ] `https://4dtech.com.br` redireciona permanentemente para `https://www.4dtech.com.br`.
- [ ] Para a primeira emissão HTTPS, DNS está em `DNS only`.
- [ ] SSL/TLS da Cloudflare está em `Full` ou `Full (strict)`.
- [ ] Não usar modo `Flexible`.
- [ ] Firewall da VPS libera `80/tcp` e `443/tcp`.
- [ ] Depois de tudo funcionando, se desejar, testar proxy laranja da Cloudflare.

## 4. Docker na VPS

- [ ] `docker compose ps` mostra containers saudáveis.
- [ ] `web` está healthy.
- [ ] `api` está healthy.
- [ ] `worker` está rodando.
- [ ] `redis` está healthy.
- [ ] `background` está healthy.
- [ ] `transcriber` está healthy.
- [ ] `caddy` está rodando.

## 5. Sitemap, robots e ads.txt

Teste no navegador:

```txt
https://www.4dtech.com.br/sitemap.xml
https://www.4dtech.com.br/robots.txt
https://www.4dtech.com.br/ads.txt
```

Checklist:

- [ ] `/sitemap.xml` abre com status 200.
- [ ] `/robots.txt` abre com status 200.
- [ ] `/ads.txt` abre com status 200.
- [ ] Sitemap usa o domínio correto em HTTPS.
- [ ] Sitemap inclui as páginas públicas dos módulos.
- [ ] Sitemap não inclui `/baixar/`.
- [ ] Sitemap não inclui `/api/`.
- [ ] Robots permite páginas públicas.
- [ ] Robots bloqueia `/baixar/`.
- [ ] Robots bloqueia `/api/`.
- [ ] `ads.txt` mostra comentário enquanto AdSense não estiver configurado.
- [ ] Depois do AdSense, `ads.txt` mostra linha parecida com:

```txt
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

Endereços locais para teste no PC:

```txt
http://localhost:8090/sitemap.xml
http://localhost:8090/robots.txt
http://localhost:8090/ads.txt
```

## 6. Testes finais antes de divulgar

- [ ] Home abre rápido no celular.
- [ ] Página `/ferramentas` abre.
- [ ] Menu mobile abre e fecha.
- [ ] Conversor HTML para PDF funciona.
- [ ] Remover fundo funciona.
- [ ] Transcrever áudio funciona.
- [ ] QR Code funciona.
- [ ] TXT para PDF funciona.
- [ ] Markdown para PDF funciona.
- [ ] Comprimir imagem funciona.
- [ ] Redimensionar imagem funciona.
- [ ] Converter imagem funciona.
- [ ] Vídeo para MP3 funciona.
- [ ] Página de download mostra botão acima dos anúncios.
- [ ] Páginas `/privacidade` e `/termos` estão revisadas.
- [ ] Search Console recebeu o sitemap.
- [ ] AdSense só foi ativado depois da aprovação.
