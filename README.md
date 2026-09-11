# Law Firm Management API

> API REST para gestão de escritórios de advocacia, construída para demonstrar práticas profissionais de Backend Java, segurança, persistência, testes e deploy containerizado.

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![CI](https://img.shields.io/github/actions/workflow/status/AnnaClara-devsoftware/lawfirm-management/ci.yml?branch=main&label=CI)

## Sobre o projeto

Sistema backend para apoiar a rotina de um escritório de advocacia. A API centraliza usuários, clientes, processos, prazos, agenda, notificações, documentos, auditoria e indicadores operacionais.

O projeto foi estruturado como uma aplicação de portfólio com foco em **Java, Spring Boot, segurança, arquitetura, banco de dados e engenharia de software**.

## Funcionalidades

- Autenticação com JWT.
- Refresh token opaco com hash BCrypt, rotação e revogação.
- Controle de acesso por `ADMIN`, `ADVOGADO` e `ASSISTENTE`.
- Ownership checks para recursos jurídicos.
- Gestão de clientes.
- Gestão de processos com número CNJ único.
- Gestão de prazos e identificação automática de vencidos.
- Agenda de reuniões, consultas e audiências.
- Notificações internas e lembretes automáticos.
- Upload, download e exclusão de documentos.
- SHA-256 dos arquivos.
- Auditoria consultável por administrador.
- Dashboard operacional.
- Paginação com limite máximo.
- Validação de entrada e tratamento global de erros.
- Swagger/OpenAPI.
- Flyway para versionamento do banco.
- Docker e Docker Compose.
- Configurações separadas para local, Docker e produção.
- Healthchecks e hardening do container.
- Testes unitários e estrutura para Testcontainers.
- CI com GitHub Actions.

## Stack

| Tecnologia | Uso |
|---|---|
| Java 21 | Linguagem/runtime |
| Spring Boot 3.3 | Framework |
| Spring Web | API REST |
| Spring Security | Autenticação/autorização |
| JJWT | Tokens JWT |
| Spring Data JPA | Persistência |
| Hibernate | ORM |
| PostgreSQL 16 | Banco de dados |
| Flyway | Migrations |
| MapStruct | Mapeamento DTO/Entity |
| Bean Validation | Validação |
| Lombok | Redução de boilerplate |
| Springdoc OpenAPI | Swagger |
| JUnit 5 / Mockito | Testes |
| Testcontainers | Integração com PostgreSQL |
| Docker | Containerização |
| GitHub Actions | CI |

## Arquitetura

```text
HTTP Client
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
PostgreSQL
```

Preocupações transversais como segurança, auditoria, exceções, configuração e documentação ficam separadas dos módulos de negócio.

Veja a documentação completa em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Módulos

```text
Authentication / Users
        ↓
      Clients
        ↓
   Legal Cases
      ↙    ↘
 Deadlines  Documents
     ↓
Notifications

Appointments ─────→ Notifications

Audit ─────────────→ operações relevantes

Dashboard ─────────→ indicadores
```

## Executando com Docker

### Desenvolvimento

```bash
cp .env.example .env
docker compose up --build
```

API: `http://localhost:8080`

Swagger: `http://localhost:8080/swagger-ui.html`

Readiness: `http://localhost:8080/actuator/health/readiness`

### Produção

```bash
cp .env.prod.example .env
```

Substitua todos os valores de exemplo, principalmente `DB_PASSWORD` e `JWT_SECRET`.

```bash
docker compose -f compose.prod.yml up -d --build
```

Detalhes em [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Executando sem Docker

Requisitos:

- JDK 21;
- Maven 3.9+;
- PostgreSQL 16+.

Configure as variáveis do `.env.example` no ambiente e execute:

```bash
mvn spring-boot:run
```

## Testes

```bash
mvn clean test
```

A CI executa os testes automaticamente a cada push e Pull Request nas branches configuradas.

A suíte tem duas camadas:

- **Unitários e fatia de contexto** (`application-test.yml`): rodam em H2, com Flyway desabilitado e `ddl-auto=create-drop`. Rápidos, mas não validam a sintaxe real das migrations (que é específica de PostgreSQL).
- **Integração** (`src/test/java/.../integration`): sobe um PostgreSQL real via **Testcontainers**, com Flyway habilitado normalmente — é isso que efetivamente confirma que as migrations rodam sem erro em Postgres e que a matriz de autorização por role está correta (ex: ASSISTENTE recebe 403 ao tentar criar processo). **Exige Docker disponível** na máquina/CI.

### Limitação conhecida

A validação do número CNJ verifica apenas o formato (20 dígitos numéricos), não o dígito verificador oficial (algoritmo mod 97 definido pela Resolução CNJ). Suficiente para o escopo deste portfólio; um próximo passo natural seria implementar o cálculo completo do dígito verificador.

## Documentação da API

Swagger UI:

```text
/swagger-ui.html
```

OpenAPI:

```text
/v3/api-docs
```

Exemplos de uso: [`docs/API.md`](docs/API.md).

## Segurança

Principais medidas:

- JWT de curta duração;
- refresh token armazenado somente como hash;
- BCrypt para senhas;
- RBAC;
- ownership checks;
- CORS configurável;
- respostas padronizadas para 401/403;
- limite de upload;
- sanitização de nomes de arquivo;
- headers de segurança;
- secrets fora do código-fonte;
- container sem root em produção;
- `no-new-privileges` e capabilities removidas no Compose de produção.

Consulte [`SECURITY.md`](SECURITY.md).

## Banco de dados

O schema é controlado por Flyway:

```text
V1  users
V2  refresh_tokens
V3  audit_logs
V4  clients
V5  legal_cases
V6  deadlines
V7  appointments
V8  notifications
V9  documents
```

Hibernate utiliza `ddl-auto=validate`, evitando que o ORM altere o schema automaticamente.

## Documentos

O arquivo é armazenado no filesystem configurado por `DOCUMENTS_DIR`. O PostgreSQL armazena metadados e SHA-256.

Em produção com múltiplas instâncias, recomenda-se object storage compartilhado.

## CI/CD

O workflow `.github/workflows/ci.yml` configura Java 21, cache Maven, executa testes e gera o pacote.

A etapa de CI é deliberadamente separada de um deploy automático: credenciais e estratégia de hospedagem devem ser definidas de acordo com o provedor escolhido.

## Estrutura do projeto

```text
lawfirm-management/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── docs/
├── src/
│   ├── main/
│   │   ├── java/com/lawfirm/management/
│   │   └── resources/
│   └── test/
├── Dockerfile
├── docker-compose.yml
├── compose.prod.yml
├── pom.xml
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
└── README.md
```

## Status

**Projeto de portfólio — versão 1.0.0 em preparação.**

A base funcional e de infraestrutura está implementada. Antes de uma implantação real, ainda devem ser executados os testes no ambiente de destino, revisados secrets, configurados backups e escolhido o storage definitivo de documentos.

## Notas desta revisão

Durante uma revisão de código foram identificadas e corrigidas as seguintes lacunas:

- **Autorização por role incompleta**: os endpoints de escrita de `LegalCase` (processos) e `Deadline` (prazos) não tinham `@PreAuthorize`, e os de `Client` (clientes) não restringiam cadastro/edição/ativação — na prática, qualquer usuário autenticado, incluindo ASSISTENTE, conseguia criar e alterar processos, prazos e clientes. Adicionado `@PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")` nesses endpoints, alinhando o comportamento com a regra de negócio: ASSISTENTE tem acesso de leitura a esses três módulos.
- **Log ausente em erros inesperados**: o handler genérico de exceções (`GlobalExceptionHandler`) retornava 500 sem registrar nada no log, tornando incidentes em produção invisíveis. Adicionado `log.error(...)` com o stack trace completo.
- **Dependência do Testcontainers declarada mas não utilizada**: o `pom.xml` incluía Testcontainers/PostgreSQL como dependência de teste, mas toda a suíte rodava em H2. Adicionado um teste de integração real (`AuthAndLegalCaseFlowIntegrationTest`) que sobe PostgreSQL via Testcontainers e valida as migrations Flyway de verdade, além da regra de autorização acima.
- **`.gitignore` ignorando `.mvn/`**: removida essa entrada — ela quebraria o Maven Wrapper caso ele seja adicionado ao projeto no futuro.
- **Busca/filtro ausente em Clientes e Processos**: `GET /api/clients` e `GET /api/legal-cases` só aceitavam paginação, sem parâmetros de busca. Adicionados `search` (nome/documento em clientes; título/CNJ em processos) e `active`/`status` respectivamente — extensão pequena e aditiva, sem alterar contratos existentes, necessária para o frontend implementar busca de forma paginação-segura (filtrar apenas a página já carregada daria resultados incompletos).

## Roadmap pós-1.0

- Ampliar a cobertura de testes de integração com Testcontainers para os demais módulos (hoje cobre o fluxo de autenticação + processo jurídico).
- Implementar o dígito verificador oficial do número CNJ (mod 97).
- Observabilidade com métricas e logs estruturados.
- Object storage para documentos.
- Rate limiting.
- Pipeline de CD conforme o provedor de cloud.
- Frontend administrativo separado.

## Licença

MIT. Consulte [`LICENSE`](LICENSE).

## Frontend

O projeto inclui um frontend completo em `frontend/`, construído com React 18, TypeScript, Vite, React Router 6, TanStack Query, Axios e Lucide React. Consome exclusivamente os endpoints reais da API descritos neste README — nenhum endpoint foi inventado. Detalhes completos (arquitetura, variáveis de ambiente, trade-offs de segurança e limitações conhecidas) estão em [`frontend/README.md`](./frontend/README.md).

### Executar

```bash
cd frontend
cp .env.example .env
npm install
npm run build   # validado: build de produção passa sem erros de TypeScript
npm run dev
```

O frontend usa `VITE_API_URL` para apontar para a API. O fluxo de autenticação armazena access/refresh tokens em `localStorage` e renova o access token automaticamente (via interceptor Axios) quando a API retorna 401.

### Telas

- Login e Cadastro
- Dashboard executivo (métricas reais da API)
- Clientes (busca, filtro por status, paginação, ativar/desativar)
- Processos jurídicos (busca, filtro por status, criação/edição, encerramento)
- Prazos (filtro por status/vencidos, concluir/cancelar)
- Agenda (compromissos, filtro por status, concluir/cancelar)
- Documentos (upload com barra de progresso, download, exclusão)
- Notificações (marcar como lida/todas como lidas)
- Usuários — listagem e detalhe (ADMIN gerencia role e status; qualquer usuário edita o próprio perfil e senha)
- Auditoria (ADMIN, com filtros por ação/entidade/usuário/período)

### Controle de acesso no frontend

Itens de menu e botões de ação (criar/editar processos, prazos e clientes; página de Usuários e Auditoria) são ocultados conforme a role do usuário logado — mas isso é só uma camada de conveniência de UX. A autoridade de segurança continua sendo o backend: mesmo que alguém manipule o frontend, o `@PreAuthorize` do Spring Security barra a requisição.
