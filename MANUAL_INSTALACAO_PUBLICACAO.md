# Manual de instalação e publicação

Projeto: **Documentos Online - 4D Tech**

Este manual mostra o caminho completo para enviar o projeto ao GitHub, baixar na VPS pelo GitHub, configurar Docker, domínio, HTTPS, AdSense, Turnstile e sitemap.

> Substitua os exemplos abaixo pelo seu domínio, usuário e repositório.
>
> Exemplo de domínio usado no manual: `documentosonline.com.br`
>
> Exemplo de repositório: `https://github.com/SEU-USUARIO/documentos-online-4dtech.git`

---

## 1. Requisitos

### No seu computador Windows

- Docker Desktop instalado.
- Git instalado.
- Conta no GitHub.
- Projeto testado localmente em:

```txt
http://localhost:8090
```

Sitemap local:

```txt
http://localhost:8090/sitemap.xml
```

Robots local:

```txt
http://localhost:8090/robots.txt
```

### Na VPS

Recomendado para começar:

- Ubuntu 22.04 ou 24.04.
- 2 vCPU ou mais.
- 4 GB RAM ou mais.
- 30 GB de disco ou mais.
- Acesso SSH.
- Docker e Docker Compose.

Para uso público com muitos arquivos, prefira 4 vCPU e 8 GB RAM.

---

## 2. Preparar o projeto antes de enviar ao GitHub

Entre na pasta do projeto:

```powershell
cd D:\python-sistemas\gerar-pdf\converter-html-pdf
```

Confirme que o arquivo `.env` não será enviado ao GitHub.

O projeto já possui `.gitignore`, mas confira se ele contém:

```txt
.env
node_modules
```

O arquivo que pode ir para o GitHub é:

```txt
.env.example
```

Nunca envie para o GitHub:

- Chaves do Turnstile.
- Código do AdSense.
- Senhas.
- Tokens.
- Arquivo `.env` real.

---

## 3. Criar o repositório no GitHub

1. Entre em [https://github.com](https://github.com).
2. Clique em **New repository**.
3. Nome sugerido:

```txt
documentos-online-4dtech
```

4. Pode deixar como **Private** no começo.
5. Não marque para criar README se o projeto já tem README.
6. Crie o repositório.

---

## 4. Enviar o projeto para o GitHub

Na pasta do projeto:

```powershell
git init
git add .
git commit -m "Versao inicial Documentos Online 4D Tech"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/documentos-online-4dtech.git
git push -u origin main
```

Se o Git pedir login, entre com sua conta do GitHub.

Se o repositório já existir localmente, use:

```powershell
git status
git add .
git commit -m "Atualiza plataforma de documentos"
git push
```

---

## 5. Apontar o domínio para a VPS

No painel onde comprou o domínio, crie:

```txt
Tipo: A
Nome: @
Valor: IP_DA_SUA_VPS
TTL: automático ou 300
```

Se quiser usar `www`:

```txt
Tipo: CNAME
Nome: www
Valor: documentosonline.com.br
TTL: automático ou 300
```

Aguarde a propagação do DNS.

Teste no seu computador:

```powershell
ping documentosonline.com.br
```

O IP retornado deve ser o IP da VPS.

---

## 6. Acessar a VPS

No Windows, abra PowerShell:

```powershell
ssh root@IP_DA_SUA_VPS
```

Ou, se usar outro usuário:

```powershell
ssh usuario@IP_DA_SUA_VPS
```

Atualize a VPS:

```bash
apt update && apt upgrade -y
```

---

## 7. Instalar Docker na VPS

No Ubuntu:

```bash
apt install -y ca-certificates curl git ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME}) stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Teste:

```bash
docker --version
docker compose version
```

---

## 8. Configurar firewall

Libere apenas SSH, HTTP e HTTPS:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## 9. Baixar o projeto na VPS pelo GitHub

Crie uma pasta para sites:

```bash
mkdir -p /opt/sites
cd /opt/sites
```

Clone o projeto:

```bash
git clone https://github.com/SEU-USUARIO/documentos-online-4dtech.git
cd documentos-online-4dtech
```

Se o repositório for privado, o GitHub pode pedir autenticação via token.

---

## 10. Criar o arquivo `.env` na VPS

Copie o exemplo:

```bash
cp .env.example .env
nano .env
```

Configure assim:

```env
SITE_ADDRESS=documentosonline.com.br
PUBLIC_ORIGIN=https://documentosonline.com.br
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443

API_INTERNAL_ORIGIN=http://api:4000
REDIS_URL=redis://redis:6379
JOB_DIR=/data/jobs
JOB_TTL_SECONDS=3600

MAX_UPLOAD_MB=25
MAX_EXTRACTED_MB=100
MAX_ZIP_FILES=500
MAX_PDF_MB=50
CONVERSION_TIMEOUT_MS=45000
MAX_IMAGE_UPLOAD_MB=15
IMAGE_TIMEOUT_MS=60000
MAX_AUDIO_UPLOAD_MB=50
AUDIO_TIMEOUT_MS=900000
WHISPER_MODEL=tiny
WORKER_CONCURRENCY=2

RATE_LIMIT_10_MINUTES=300
RATE_LIMIT_HOUR=2000

NEXT_PUBLIC_API_BASE=/api

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=
NEXT_PUBLIC_GA_ID=

ACME_EMAIL=seu-email@dominio.com
```

Salve no Nano:

```txt
CTRL + O
ENTER
CTRL + X
```

### Importante sobre HTTPS

O Caddy vai gerar HTTPS automático quando:

- `SITE_ADDRESS` estiver com domínio real.
- DNS estiver apontando para a VPS.
- Portas 80 e 443 estiverem abertas.

Se quiser publicar também com `www`, altere:

```env
SITE_ADDRESS=documentosonline.com.br, www.documentosonline.com.br
PUBLIC_ORIGIN=https://documentosonline.com.br
```

---

## 11. Subir o projeto na VPS

Na pasta do projeto:

```bash
docker compose up -d --build
```

Verifique:

```bash
docker compose ps
```

Você deve ver serviços como:

- `web`
- `api`
- `worker`
- `background`
- `redis`
- `caddy`

Ver logs:

```bash
docker compose logs -f
```

Ver logs só da API e worker:

```bash
docker compose logs -f api worker
```

---

## 12. Testar o site na VPS

Abra:

```txt
https://documentosonline.com.br
```

Teste páginas:

```txt
https://documentosonline.com.br/ferramentas
https://documentosonline.com.br/html-para-pdf
https://documentosonline.com.br/remover-fundo-de-imagem
https://documentosonline.com.br/comprimir-pdf
https://documentosonline.com.br/juntar-pdf
```

Teste arquivos técnicos:

```txt
https://documentosonline.com.br/sitemap.xml
https://documentosonline.com.br/robots.txt
https://documentosonline.com.br/ads.txt
```

Endereço local do sitemap, quando rodando no seu PC:

```txt
http://localhost:8090/sitemap.xml
```

Endereço público do sitemap, depois de publicar:

```txt
https://documentosonline.com.br/sitemap.xml
```

---

## 13. Configurar Cloudflare Turnstile

O Turnstile ajuda a evitar abuso de upload/conversão.

1. Acesse [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Entre em **Turnstile**.
3. Crie um novo widget.
4. Tipo recomendado: **Managed**.
5. Adicione seu domínio:

```txt
documentosonline.com.br
www.documentosonline.com.br
```

6. Copie:

- Site key.
- Secret key.

Na VPS, edite `.env`:

```bash
nano .env
```

Preencha:

```env
TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
```

Recrie os containers:

```bash
docker compose up -d --build
```

---

## 14. Configurar AdSense

### 14.1 Antes de ativar anúncios

Antes de enviar para aprovação no AdSense, confira:

- Site online com HTTPS.
- Páginas de privacidade e termos funcionando.
- Conteúdo útil nas páginas dos módulos.
- Menu funcionando.
- Sitemap funcionando.
- `ads.txt` acessível.

Páginas importantes:

```txt
https://documentosonline.com.br/privacidade
https://documentosonline.com.br/termos
https://documentosonline.com.br/como-funciona
https://documentosonline.com.br/duvidas
```

### 14.2 Criar conta/site no AdSense

1. Acesse [https://www.google.com/adsense](https://www.google.com/adsense).
2. Adicione o site:

```txt
documentosonline.com.br
```

3. Siga o processo de verificação do Google.
4. Aguarde a aprovação.

### 14.3 Onde configurar AdSense no projeto

O projeto já está preparado para AdSense nestas variáveis do `.env`:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=
```

#### `NEXT_PUBLIC_ADSENSE_CLIENT`

É o ID do editor AdSense.

Exemplo:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
```

#### `NEXT_PUBLIC_ADSENSE_HOME_SLOT`

É o ID do bloco de anúncio da home.

Exemplo:

```env
NEXT_PUBLIC_ADSENSE_HOME_SLOT=1111111111
```

#### `NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT`

É o ID do bloco de anúncio da página de download.

Exemplo:

```env
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=2222222222
```

### 14.4 Onde os anúncios aparecem

Atualmente o projeto usa o componente:

```txt
apps/web/components/AdSlot.tsx
```

Os anúncios já estão posicionados:

- Na home, abaixo do conteúdo útil.
- Na página de download, abaixo do botão de download e separado dos controles.

Isso evita confundir anúncio com botão de download.

### 14.5 Como ativar depois da aprovação

Na VPS:

```bash
nano .env
```

Preencha:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
NEXT_PUBLIC_ADSENSE_HOME_SLOT=1111111111
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=2222222222
```

Depois rode:

```bash
docker compose up -d --build web
```

Teste:

```txt
https://documentosonline.com.br
https://documentosonline.com.br/baixar/ALGUM_TOKEN_VALIDO
https://documentosonline.com.br/ads.txt
```

O arquivo `ads.txt` é gerado automaticamente com base em:

```env
NEXT_PUBLIC_ADSENSE_CLIENT
```

Exemplo esperado:

```txt
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

---

## 15. Configurar Google Search Console

1. Acesse [https://search.google.com/search-console](https://search.google.com/search-console).
2. Adicione a propriedade do domínio:

```txt
documentosonline.com.br
```

3. Faça a verificação por DNS, se possível.
4. Depois vá em **Sitemaps**.
5. Envie:

```txt
https://documentosonline.com.br/sitemap.xml
```

Também confira:

```txt
https://documentosonline.com.br/robots.txt
```

As páginas temporárias de download e API não devem aparecer no sitemap.

---

## 16. Configurar Google Analytics 4, opcional

Se quiser usar GA4:

1. Crie uma propriedade no Google Analytics.
2. Copie o ID, exemplo:

```txt
G-XXXXXXXXXX
```

3. Configure no `.env`:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. Recrie o web:

```bash
docker compose up -d --build web
```

---

## 17. Atualizar o site depois de mudanças no GitHub

Quando você alterar algo no PC:

```powershell
git add .
git commit -m "Atualiza site"
git push
```

Na VPS:

```bash
cd /opt/sites/documentos-online-4dtech
git pull
docker compose up -d --build
```

Verifique:

```bash
docker compose ps
```

---

## 18. Comandos úteis de manutenção

Ver containers:

```bash
docker compose ps
```

Ver logs gerais:

```bash
docker compose logs -f
```

Ver logs da API:

```bash
docker compose logs -f api
```

Ver logs do worker:

```bash
docker compose logs -f worker
```

Reiniciar tudo:

```bash
docker compose restart
```

Parar tudo:

```bash
docker compose down
```

Subir novamente:

```bash
docker compose up -d
```

Ver uso de disco Docker:

```bash
docker system df
```

Limpar imagens antigas sem uso:

```bash
docker image prune -f
```

---

## 19. Backup

Não faça backup dos arquivos enviados pelos usuários.

Eles são temporários e ficam no volume:

```txt
jobs
```

Faça backup apenas de:

- Código no GitHub.
- Arquivo `.env` guardado com segurança fora da VPS.
- Configurações importantes do domínio.

Nunca publique o `.env` no GitHub.

---

## 20. Checklist antes de divulgar

Antes de mandar tráfego para o site, confira:

- [ ] Domínio aponta para a VPS.
- [ ] HTTPS funcionando.
- [ ] `https://documentosonline.com.br/sitemap.xml` abre.
- [ ] `https://documentosonline.com.br/robots.txt` abre.
- [ ] `https://documentosonline.com.br/ads.txt` abre.
- [ ] Conversor HTML para PDF funciona.
- [ ] Remover fundo funciona.
- [ ] Transcrever áudio em texto funciona.
- [ ] Gerador de QR Code funciona.
- [ ] Comprimir PDF funciona.
- [ ] Juntar PDF funciona.
- [ ] Dividir PDF funciona.
- [ ] Proteger/remover senha funciona.
- [ ] Word/Excel/PDF conversores funcionam.
- [ ] Páginas `/privacidade` e `/termos` estão revisadas.
- [ ] Turnstile configurado.
- [ ] Search Console configurado.
- [ ] Sitemap enviado no Search Console.
- [ ] AdSense aprovado antes de ativar blocos reais.

---

## 21. Rotas públicas principais

```txt
/
/ferramentas
/html-para-pdf
/remover-fundo-de-imagem
/transcrever-audio-em-texto
/qr-code
/word-para-pdf
/excel-para-pdf
/pdf-para-excel
/pdf-para-word
/editar-pdf
/comprimir-pdf
/juntar-pdf
/dividir-pdf
/imagem-para-pdf
/pdf-para-jpg
/assinar-pdf
/proteger-pdf
/remover-senha-pdf
/organizar-pdf
/como-funciona
/duvidas
/privacidade
/termos
/sitemap.xml
/robots.txt
/ads.txt
```

Rotas temporárias como `/baixar/[token]` não entram no sitemap.

---

## 22. Observação importante sobre Google

Este projeto já está preparado para boa indexação técnica:

- Páginas exclusivas por módulo.
- Titles e descriptions por página.
- Sitemap XML.
- Robots.
- Conteúdo em português.
- Layout responsivo.
- Anúncios separados dos botões.

Mesmo assim, ninguém consegue garantir posição no Google. O objetivo é deixar o site rastreável, rápido, útil e organizado para disputar boas posições com o tempo.

---

## 23. Configurar domínio próprio usando Cloudflare

Este é o cenário recomendado:

```txt
Usuário -> Cloudflare -> VPS -> Caddy -> Docker web/api
```

Você vai apontar o domínio para o IP público da VPS. Na VPS, o site deve responder pela porta 80 e o Caddy cuida do acesso externo.

### 23.1 Adicionar domínio na Cloudflare

1. Acesse sua conta Cloudflare.
2. Clique em **Add a domain** ou **Adicionar site**.
3. Informe seu domínio, por exemplo:

```txt
documentosonline.com.br
```

4. Escolha o plano desejado. O plano gratuito costuma ser suficiente para começar.
5. A Cloudflare vai mostrar os nameservers dela.
6. Vá no painel onde você comprou o domínio e troque os nameservers antigos pelos nameservers da Cloudflare.

Exemplo:

```txt
ada.ns.cloudflare.com
brad.ns.cloudflare.com
```

Os nameservers reais serão os que a Cloudflare mostrar para sua conta.

### 23.2 Criar DNS apontando para a VPS

No painel da Cloudflare, entre em:

```txt
Domain -> DNS -> Records
```

Crie o registro principal:

```txt
Type: A
Name: @
IPv4 address: IP_DA_SUA_VPS
Proxy status: DNS only ou Proxied
TTL: Auto
```

Crie também o `www`, se quiser:

```txt
Type: CNAME
Name: www
Target: documentosonline.com.br
Proxy status: DNS only ou Proxied
TTL: Auto
```

### 23.3 DNS only ou Proxied?

Para a primeira instalação, use **DNS only**. É o modo mais simples para o Caddy gerar o certificado HTTPS sem confusão.

Depois que o site estiver funcionando com HTTPS, você pode testar **Proxied** na Cloudflare.

Resumo:

```txt
Primeiro teste: DNS only
Depois de tudo funcionando: pode testar Proxied
```

### 23.4 Configurar SSL/TLS na Cloudflare

No painel da Cloudflare, vá em:

```txt
SSL/TLS
```

Use:

```txt
Full
```

ou:

```txt
Full (strict)
```

O melhor para produção é **Full (strict)**, desde que o Caddy já tenha conseguido gerar o certificado válido.

Evite usar:

```txt
Flexible
```

O modo Flexible pode causar loop de redirecionamento e problemas de HTTPS, porque a Cloudflare fala com sua VPS por HTTP enquanto o usuário acessa HTTPS.

### 23.5 Configurar portas na VPS

Na VPS, libere:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

No `.env` da VPS, use:

```env
SITE_ADDRESS=documentosonline.com.br
PUBLIC_ORIGIN=https://documentosonline.com.br
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
ACME_EMAIL=seu-email@dominio.com
```

Se quiser aceitar `www` também:

```env
SITE_ADDRESS=documentosonline.com.br, www.documentosonline.com.br
PUBLIC_ORIGIN=https://documentosonline.com.br
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
ACME_EMAIL=seu-email@dominio.com
```

### 23.6 Sobre a porta 80 no Docker

No seu PC local você usa:

```env
HOST_PORT=8090
HTTPS_PORT=8443
HTTPS_UDP_PORT=8443
PUBLIC_ORIGIN=http://localhost:8090
SITE_ADDRESS=http://localhost
```

Na VPS você deve usar:

```env
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
PUBLIC_ORIGIN=https://documentosonline.com.br
SITE_ADDRESS=documentosonline.com.br
```

Isso faz o Caddy ficar acessível publicamente na porta 80 da VPS. O Caddy então encaminha internamente para os containers `web` e `api`.

### 23.7 Atenção sobre HTTPS e porta 443

No ambiente local, o `docker-compose.yml` publica a porta configurada em:

```env
HOST_PORT=8090
```

Na VPS, use o arquivo de produção junto com o compose principal:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

O `docker-compose.yml` usa as variáveis `HOST_PORT`, `HTTPS_PORT` e `HTTPS_UDP_PORT`.

No seu PC local, o `.env` usa:

```env
HOST_PORT=8090
HTTPS_PORT=8443
HTTPS_UDP_PORT=8443
```

Na VPS, use:

```env
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
```

Assim o Caddy recebe tráfego nas portas públicas:

```yaml
ports:
  - "${HOST_PORT:-8090}:80"
  - "${HTTPS_PORT:-8443}:443"
  - "${HTTPS_UDP_PORT:-8443}:443/udp"
```

Ou seja: na VPS você não precisa editar manualmente o `docker-compose.yml` principal para publicar HTTPS. Basta configurar o `.env` de produção e usar o comando com os dois arquivos.

Se alterar `.env` ou atualizar o código, suba novamente em produção com:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Na VPS, mantenha:

```env
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
```

### 23.8 Testes depois de apontar o domínio

No seu computador:

```powershell
ping documentosonline.com.br
```

Na VPS:

```bash
curl -I http://documentosonline.com.br
curl -I https://documentosonline.com.br
```

No navegador:

```txt
https://documentosonline.com.br
https://documentosonline.com.br/sitemap.xml
https://documentosonline.com.br/robots.txt
https://documentosonline.com.br/ads.txt
```

---

## 24. Explicação das variáveis do `.env`

Esta seção explica as variáveis que normalmente geram dúvida.

### 24.1 Turnstile

O Turnstile é a proteção da Cloudflare contra abuso, bots e envios automáticos. Ele funciona como alternativa moderna ao CAPTCHA.

Variáveis:

```env
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

#### `TURNSTILE_SITE_KEY`

Chave pública do widget Turnstile.

Onde obter:

```txt
Cloudflare -> Turnstile -> seu widget -> Site key
```

Obrigatório?

```txt
Não para teste local.
Sim recomendado para produção.
```

#### `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Também é a chave pública do Turnstile, mas exposta para o frontend Next.js.

Normalmente use o mesmo valor de `TURNSTILE_SITE_KEY`:

```env
TURNSTILE_SITE_KEY=0x4AAAA...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...
```

Obrigatório?

```txt
Não para teste local.
Sim recomendado para produção.
```

#### `TURNSTILE_SECRET_KEY`

Chave secreta usada pela API para validar se o envio é legítimo.

Onde obter:

```txt
Cloudflare -> Turnstile -> seu widget -> Secret key
```

Obrigatório?

```txt
Não para teste local.
Sim recomendado para produção.
```

Importante:

```txt
TURNSTILE_SECRET_KEY nunca deve ir para GitHub.
```

### 24.2 API pública do frontend

```env
NEXT_PUBLIC_API_BASE=/api
```

Essa variável diz ao frontend onde encontrar a API.

No projeto atual, mantenha:

```env
NEXT_PUBLIC_API_BASE=/api
```

Obrigatório?

```txt
Sim, mas o valor padrão correto é /api.
```

Só mude se um dia a API estiver em outro domínio, por exemplo:

```env
NEXT_PUBLIC_API_BASE=https://api.documentosonline.com.br
```

Para o seu caso, não mude.

### 24.3 Transcrição de áudio

Variáveis:

```env
MAX_AUDIO_UPLOAD_MB=50
AUDIO_TIMEOUT_MS=900000
WHISPER_MODEL=tiny
```

#### `MAX_AUDIO_UPLOAD_MB`

Tamanho máximo do arquivo enviado no módulo **Transcrever áudio em texto**.

Obrigatório?

```txt
Não precisa mudar. O padrão de 50 MB é suficiente para começar.
```

#### `AUDIO_TIMEOUT_MS`

Tempo máximo que a transcrição pode ficar processando antes de ser cancelada.

Exemplo:

```env
AUDIO_TIMEOUT_MS=900000
```

Isso equivale a 15 minutos.

Obrigatório?

```txt
Não precisa mudar no início.
```

#### `WHISPER_MODEL`

Modelo de transcrição usado pelo serviço interno.

Recomendado para VPS com 2 cores e 4 GB de RAM:

```env
WHISPER_MODEL=tiny
```

O modelo `tiny` é mais leve e rápido. Modelos maiores podem melhorar a qualidade, mas consomem mais memória, CPU e tempo. Para publicar primeiro sem travar a VPS, comece com `tiny`.

Observação:

```txt
Na primeira transcrição, o Docker pode demorar um pouco mais porque baixa/prepara o modelo.
```

### 24.4 AdSense

Variáveis:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=
```

Use somente depois que o site for aprovado no Google AdSense.

#### `NEXT_PUBLIC_ADSENSE_CLIENT`

É o ID do seu editor no AdSense.

Exemplo:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
```

Onde obter:

```txt
Google AdSense -> Conta -> Informações da conta -> ID do editor
```

ou no código de anúncio gerado pelo AdSense:

```html
data-ad-client="ca-pub-1234567890123456"
```

Obrigatório?

```txt
Não.
Só é obrigatório se quiser exibir anúncios.
```

#### `NEXT_PUBLIC_ADSENSE_HOME_SLOT`

É o ID do bloco de anúncio da home.

Exemplo:

```env
NEXT_PUBLIC_ADSENSE_HOME_SLOT=1111111111
```

Onde obter:

```txt
Google AdSense -> Anúncios -> Por bloco de anúncios -> Criar bloco
```

No código do anúncio, procure:

```html
data-ad-slot="1111111111"
```

Obrigatório?

```txt
Não.
Sem ele, o anúncio da home não aparece.
```

#### `NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT`

É o ID do bloco de anúncio da página de download.

Exemplo:

```env
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=2222222222
```

Onde obter:

```txt
Google AdSense -> Anúncios -> Por bloco de anúncios -> Criar bloco
```

Obrigatório?

```txt
Não.
Sem ele, o anúncio da página de download não aparece.
```

Observação importante:

```txt
O botão de download deve ficar longe do anúncio.
O projeto já posiciona o anúncio abaixo da área de download para evitar confusão.
```

### 24.4 Google Analytics

```env
NEXT_PUBLIC_GA_ID=
```

É o ID do Google Analytics 4.

Exemplo:

```env
NEXT_PUBLIC_GA_ID=G-ABC1234567
```

Onde obter:

```txt
Google Analytics -> Admin -> Fluxos de dados -> Web -> ID da métrica
```

Obrigatório?

```txt
Não.
É opcional.
```

Use se quiser acompanhar visitas, páginas acessadas e eventos.

### 24.5 E-mail do Caddy

```env
ACME_EMAIL=
```

Esse e-mail é usado pelo Caddy/Let's Encrypt para emitir certificados HTTPS e avisar sobre problemas de renovação.

Exemplo:

```env
ACME_EMAIL=contato@documentosonline.com.br
```

Obrigatório?

```txt
Não é estritamente obrigatório, mas é altamente recomendado em produção.
```

Use um e-mail real que você acesse.

---

## 25. Exemplo de `.env` local e `.env` de produção

### Local no seu PC

```env
SITE_ADDRESS=http://localhost
PUBLIC_ORIGIN=http://localhost:8090
HOST_PORT=8090
HTTPS_PORT=8443
HTTPS_UDP_PORT=8443
NEXT_PUBLIC_API_BASE=/api
MAX_AUDIO_UPLOAD_MB=50
AUDIO_TIMEOUT_MS=900000
WHISPER_MODEL=tiny

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=
NEXT_PUBLIC_GA_ID=

ACME_EMAIL=
```

### Produção na VPS com Cloudflare

```env
SITE_ADDRESS=documentosonline.com.br, www.documentosonline.com.br
PUBLIC_ORIGIN=https://documentosonline.com.br
HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443
NEXT_PUBLIC_API_BASE=/api
MAX_AUDIO_UPLOAD_MB=50
AUDIO_TIMEOUT_MS=900000
WHISPER_MODEL=tiny

TURNSTILE_SITE_KEY=0x4AAAA...
TURNSTILE_SECRET_KEY=0x4AAAA_SECRET...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...

NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
NEXT_PUBLIC_ADSENSE_HOME_SLOT=1111111111
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=2222222222
NEXT_PUBLIC_GA_ID=G-ABC1234567

ACME_EMAIL=contato@documentosonline.com.br
```

Lembrete:

```txt
O .env de produção não deve ser enviado ao GitHub.
```
