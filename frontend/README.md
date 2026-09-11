# Lawfirm Management — Frontend

Interface web para o sistema de gestão de escritórios de advocacia, consumindo a API REST do backend Spring Boot.

## Tecnologias

- React 18 + TypeScript
- Vite
- React Router 6
- Axios (com interceptors de autenticação e refresh automático)
- TanStack Query (cache, mutations, invalidação)
- Lucide React (ícones)
- CSS puro (variáveis CSS, sem framework de UI)

## Estrutura

```
src/
├── components/
│   ├── layout/     # Sidebar, Header, AppLayout
│   ├── ui/         # Button, Input, Select, Modal, Badge, Pagination, etc.
│   ├── forms/      # SearchInput (busca com debounce)
│   ├── tables/     # TableContainer (rolagem horizontal responsiva)
│   └── feedback/   # ToastProvider
├── pages/          # Uma pasta por módulo (Login, Dashboard, Clients, Cases, ...)
├── services/       # Um arquivo por domínio, todos usando o cliente Axios central (api.ts)
├── hooks/          # useAuth, useToast, useDebounce
├── context/        # AuthContext
├── routes/         # AppRoutes, ProtectedRoute, RoleRoute
├── types/          # Tipos espelhando exatamente os DTOs do backend
├── constants/      # Labels de enums, navegação, tamanho de página
└── utils/          # Formatação de datas/documentos, extração de mensagens de erro
```

## Configuração

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base do backend (sem `/api` no final), ex: `http://localhost:8080` |

## Execução local

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. O backend precisa estar rodando (veja o README na raiz do projeto).

## Build de produção

```bash
npm run build
npm run preview
```

## Autenticação

- Login e cadastro consomem `POST /api/auth/login` e `POST /api/auth/register`.
- Tokens (access + refresh) ficam em `localStorage`. **Trade-off documentado**: como o backend retorna os tokens no corpo JSON (não como cookie httpOnly), essa é a única forma de persistir sessão sem alterar o contrato da API — o que fica vulnerável a XSS caso uma dependência maliciosa seja introduzida no futuro. Mitigação atual: nenhuma lib do projeto manipula `innerHTML` com conteúdo não confiável.
- Um interceptor do Axios renova o access token automaticamente via `POST /api/auth/refresh` quando uma requisição recebe 401, reenviando a requisição original após a renovação. Se o refresh falhar, o usuário é redirecionado para `/login`.
- Rotas são protegidas por `ProtectedRoute` (exige login) e `RoleRoute` (exige role específica — usado em `/users` e `/audit-logs`, restritos a ADMIN).
- Itens de menu e ações de escrita (criar/editar processos, prazos e clientes) são ocultados para o perfil ASSISTENTE no frontend — mas a autoridade final de segurança continua sendo o backend (`@PreAuthorize`), o frontend só evita mostrar ações que o backend rejeitaria.

## Limitações conhecidas

- O dropdown de "advogado responsável" (em Clientes, Processos e Agenda) busca até 100 usuários via `GET /users` — não existe endpoint dedicado de listagem de advogados no backend. Suficiente para o volume esperado de um escritório, mas não escala para milhares de usuários.
- Não há biblioteca de calendário visual na Agenda — os compromissos são exibidos em tabela ordenável, por decisão consciente de evitar dependências desnecessárias (conforme solicitado).
