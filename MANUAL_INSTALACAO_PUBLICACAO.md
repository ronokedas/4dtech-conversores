# Instalação e atualização — Documentos Online 4D Tech

Domínio: `https://www.4dtech.com.br`

GitHub: `https://github.com/ronokedas/4dtech-conversores.git`

Substitua apenas:

- `IP_DA_VPS` pelo IP público da VPS.
- `SEU_EMAIL` pelo seu e-mail.
- Chaves do Turnstile, caso queira ativá-lo.

## 1. Configurar a Cloudflare

Crie estes registros DNS:

```txt
A      @      IP_DA_VPS
CNAME  www    4dtech.com.br
```

Na primeira instalação, deixe como `DNS only`. Em **SSL/TLS**, escolha `Full (strict)`. Depois que o HTTPS funcionar, você pode ativar o proxy laranja.

## 2. Entrar e atualizar o Ubuntu

No PowerShell do Windows:

```powershell
ssh ubuntu@IP_DA_VPS
```

Na VPS:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
sudo apt clean
```

Se o Ubuntu pedir reinicialização:

```bash
sudo reboot
```

Espere alguns segundos e conecte novamente:

```powershell
ssh ubuntu@IP_DA_VPS
```

## 3. Instalar Nano, Git, Curl e firewall

```bash
sudo apt install -y nano git curl ca-certificates ufw
```

## 4. Instalar Docker e Docker Compose

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME}) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Teste:

```bash
sudo docker --version
sudo docker compose version
sudo docker run --rm hello-world
```

## 5. Liberar as portas

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

## 6. Baixar o projeto do GitHub

```bash
sudo mkdir -p /opt/sites
sudo chown -R ubuntu:ubuntu /opt/sites
cd /opt/sites
git clone https://github.com/ronokedas/4dtech-conversores.git
cd /opt/sites/4dtech-conversores
```

Se a pasta já existir, não clone novamente. Use:

```bash
cd /opt/sites/4dtech-conversores
sudo chown -R ubuntu:ubuntu /opt/sites/4dtech-conversores
git pull origin main
```

Não use `sudo git pull`.

## 7. Criar e configurar o `.env`

```bash
cd /opt/sites/4dtech-conversores
cp .env.example .env
nano .env
```

Confirme pelo menos estes valores:

```env
SITE_ADDRESS=www.4dtech.com.br
REDIRECT_SITE_ADDRESS=4dtech.com.br
PUBLIC_ORIGIN=https://www.4dtech.com.br

HOST_PORT=80
HTTPS_PORT=443
HTTPS_UDP_PORT=443

NEXT_PUBLIC_API_BASE=/api

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-4388472032924706
NEXT_PUBLIC_ADSENSE_HOME_SLOT=4276803076
NEXT_PUBLIC_ADSENSE_DOWNLOAD_SLOT=4276803076

ACME_EMAIL=SEU_EMAIL
```

No Nano:

```txt
CTRL + O
ENTER
CTRL + X
```

O `.env` fica em:

```txt
/opt/sites/4dtech-conversores/.env
```

Para enxergar arquivos ocultos:

```bash
ls -la
```

## 8. Subir o site

```bash
cd /opt/sites/4dtech-conversores
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --force-recreate
```

Confira:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

Se houver erro:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=200
```

## 9. Testar a publicação

```bash
curl -I https://www.4dtech.com.br
curl -I https://4dtech.com.br
curl -sS https://www.4dtech.com.br/ads.txt
curl -sS https://www.4dtech.com.br/robots.txt
curl -sS https://www.4dtech.com.br/sitemap.xml | head -20
```

Endereços importantes:

```txt
https://www.4dtech.com.br
https://www.4dtech.com.br/sitemap.xml
https://www.4dtech.com.br/robots.txt
https://www.4dtech.com.br/ads.txt
https://www.4dtech.com.br/agencia-rosano
```

## 10. Enviar alterações do Windows para o GitHub

Abra o PowerShell na pasta do repositório:

```powershell
cd C:\Users\ronok\Documents\Codex\2026-07-12\te\work\4dtech-conversores
git status
git add .
git commit -m "Atualiza o site"
git push origin main
git log -1 --oneline
```

Nunca envie o arquivo `.env` real.

## 11. Atualizar a VPS depois do `git push`

```bash
cd /opt/sites/4dtech-conversores
sudo chown -R ubuntu:ubuntu /opt/sites/4dtech-conversores
git pull origin main
git log -1 --oneline
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --force-recreate
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

Se apenas arquivos `.md` foram alterados, não é necessário reconstruir o Docker. Basta executar `git pull origin main`.

## 12. Comandos úteis

Ver containers:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

Ver logs:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

Reiniciar:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

Parar:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

Subir novamente:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Ver espaço usado:

```bash
df -h
sudo docker system df
```

Limpar imagens Docker antigas:

```bash
sudo docker image prune -f
```

## Resumo

```txt
Windows: editar -> git add -> git commit -> git push
VPS: git pull -> sudo docker compose up -d --build --force-recreate
```
