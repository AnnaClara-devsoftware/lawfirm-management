# Security Policy

## Reportando uma vulnerabilidade

Não publique vulnerabilidades de segurança em issues públicas.

Para este projeto de portfólio, abra um canal privado com a mantenedora do repositório e forneça:

- descrição do problema;
- impacto potencial;
- passos para reprodução;
- evidências mínimas necessárias;
- sugestão de correção, se disponível.

## Princípios de segurança

O projeto utiliza:

- JWT para autenticação stateless;
- BCrypt para senhas;
- refresh tokens armazenados como hash;
- RBAC por roles;
- ownership checks;
- CORS configurável;
- headers de segurança;
- limite de upload;
- sanitização de nomes de arquivos;
- tratamento padronizado de 401/403;
- secrets fora do código-fonte.

Nenhum ambiente de produção deve utilizar os valores de exemplo do repositório.
