# Deploy

## Pré-requisitos

- JDK 21 para execução local;
- Docker e Docker Compose para execução containerizada;
- PostgreSQL 16+ quando executado fora do Compose;
- secrets reais em produção.

## Local com Docker

```bash
cp .env.example .env
docker compose up --build
```

API: `http://localhost:8080`

Health: `http://localhost:8080/actuator/health/readiness`

## Produção

```bash
cp .env.prod.example .env
```

Edite todos os valores sensíveis antes de subir a aplicação.

```bash
docker compose -f compose.prod.yml up -d --build
```

Verifique:

```bash
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs -f app
```

## Secrets

Nunca faça commit de:

- `.env`;
- senhas de banco;
- `JWT_SECRET`;
- tokens;
- chaves privadas;
- credenciais de serviços externos.

Em um provedor cloud, prefira Secret Manager/Secrets do próprio ambiente.

## Banco e documentos

Os volumes `postgres_data` e `documents_data` são persistentes. Backup do PostgreSQL deve ser externo ao container.

Para produção com múltiplas réplicas da API, migre o armazenamento de documentos para object storage compartilhado.

## Proxy reverso e TLS

A aplicação expõe HTTP na porta configurada. Em produção, coloque um reverse proxy ou load balancer na frente dela para:

- TLS/HTTPS;
- domínio;
- rate limiting;
- compressão;
- observabilidade;
- roteamento.

## Healthchecks

Readiness:

```text
GET /actuator/health/readiness
```

Liveness/health geral:

```text
GET /actuator/health
```

## Migrações

Flyway executa as migrations versionadas na inicialização. Não edite migrations já aplicadas em um ambiente compartilhado; crie uma nova versão.
