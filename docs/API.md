# Guia rápido da API

Base local: `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui.html`

OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 1. Registrar usuário

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "SenhaForte123!",
  "phone": "83999999999",
  "role": "ADVOGADO"
}
```

O cadastro público não permite criar `ADMIN`. O primeiro administrador deve ser provisionado de forma controlada pelo bootstrap de infraestrutura.

## 2. Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ana@example.com",
  "password": "SenhaForte123!"
}
```

A resposta fornece `accessToken` e `refreshToken`.

## 3. Requisição autenticada

```http
Authorization: Bearer <accessToken>
```

## 4. Cliente

```http
POST /api/clients
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "Maria Oliveira",
  "document": "12345678909",
  "email": "maria@example.com",
  "phone": "83988887777"
}
```

## 5. Processo

```http
POST /api/legal-cases
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "cnjNumber": "00000000000000000000",
  "title": "Ação de cobrança",
  "subject": "Cobrança contratual",
  "court": "1ª Vara Cível",
  "tribunal": "TJPB",
  "priority": "NORMAL",
  "clientId": "00000000-0000-0000-0000-000000000000"
}
```

## 6. Prazo

```http
POST /api/deadlines
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "title": "Apresentar contestação",
  "description": "Protocolar contestação no processo",
  "dueDate": "2026-10-15",
  "priority": "HIGH",
  "legalCaseId": "00000000-0000-0000-0000-000000000000"
}
```

## 7. Agenda

```http
POST /api/appointments
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Os compromissos possuem data/hora inicial e final, tipo, local e vínculos opcionais.

## 8. Documentos

```http
POST /api/documents
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Campos aceitos:

- `file`: arquivo obrigatório;
- `legalCaseId`: vínculo opcional;
- `clientId`: vínculo opcional;
- `description`: descrição opcional.

Limite configurado: 10 MB.

## 9. Notificações

```http
GET /api/notifications?unread=true
GET /api/notifications/unread/count
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all
```

## 10. Dashboard

```http
GET /api/dashboard
Authorization: Bearer <accessToken>
```

Retorna indicadores adequados ao perfil autenticado.

## Paginação

Endpoints de listagem aceitam os parâmetros padrão do Spring Data:

```text
?page=0&size=20&sort=createdAt,desc
```

O tamanho máximo é 100.

## Erros

A API utiliza respostas JSON padronizadas para erros, incluindo validação, recurso inexistente, operação proibida, não autenticado e conflitos de integridade.

Exemplo conceitual:

```json
{
  "timestamp": "2026-09-09T23:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Cliente não encontrado.",
  "path": "/api/clients/00000000-0000-0000-0000-000000000000"
}
```

Para a especificação completa, use o Swagger/OpenAPI da aplicação.
