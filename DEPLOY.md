# Publicação

## VPS Linux

Use uma VPS com Docker Engine, pelo menos 2 vCPU, 4 GB de RAM e 20 GB livres. Aponte os registros A/AAAA do domínio para a VPS, copie o projeto, preencha `.env` e execute:

```sh
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose ps
```

O arquivo `docker-compose.prod.yml` fixa `https://www.4dtech.com.br` como domínio canônico e redireciona `4dtech.com.br` para `www`. Mantenha no firewall somente SSH, 80/TCP, 443/TCP e 443/UDP.

## AdSense, consentimento e métricas

Preencha as variáveis `NEXT_PUBLIC_ADSENSE_*` somente depois da aprovação. Configure a plataforma de consentimento no painel do Google e publique um `ads.txt` real pelo arquivo gerado em `apps/web/app/ads.txt/route.ts`. Nunca clique nos anúncios do próprio site.

## Operação

```sh
docker compose logs -f api worker
docker compose exec redis redis-cli XLEN bull:conversions:events
docker system df
```

Arquivos de usuários não devem ser incluídos em backup. Faça backup apenas do código e da configuração segura fora do servidor.
