# Contribuindo

## Fluxo recomendado

1. Crie uma branch descritiva.
2. Faça alterações pequenas e focadas.
3. Adicione ou atualize testes para regras de negócio.
4. Execute `mvn clean test`.
5. Atualize a documentação quando o contrato da API mudar.
6. Abra um Pull Request explicando a mudança.

## Convenções

- Java 21.
- Spring Boot 3.
- Controllers finos; regras no service.
- DTOs para entrada/saída da API.
- Repositories sem regras de negócio complexas.
- Exceptions de domínio tratadas pelo handler global.
- Migrations Flyway para alterações de schema.
- Nunca commitar secrets.

## Checklist de Pull Request

- [ ] Código compilando.
- [ ] Testes passando.
- [ ] Regras de autorização revisadas.
- [ ] Migration adicionada, se necessário.
- [ ] Swagger/documentação atualizados.
- [ ] Nenhum secret ou dado sensível no commit.
