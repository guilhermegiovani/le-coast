# Deployment

## Objetivo

Documentar a estratégia de deploy da Le Coast, definindo como os serviços serão publicados, atualizados e monitorados em ambiente de produção.

---

## Arquitetura

A aplicação será dividida em serviços independentes.

```text
Cliente
    │
    ▼
lecoast.com
    │
    ▼
Next.js (Web)

    │
    ▼

api.lecoast.com
    │
    ▼
Express API

    │
    ▼

PostgreSQL
```

Essa arquitetura permite evolução independente entre frontend e backend, além de facilitar futuras integrações, como aplicativos móveis.

---

## Ambientes

Serão utilizados diferentes ambientes durante o desenvolvimento da aplicação.

| Ambiente    | Finalidade                           |
|-------------|--------------------------------------|
| Development | Desenvolvimento local                |
| Staging     | Validação antes da produção          |
| Production  | Ambiente utilizado pelos clientes    |

---

## Hospedagem

### Frontend

- Vercel

### Backend

Em definição.

### Banco de Dados

- PostgreSQL

### Armazenamento de Imagens

- Cloudinary

---

## Variáveis de Ambiente

Informações sensíveis deverão ser armazenadas em variáveis de ambiente.

Exemplos:

- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- CLOUDINARY_URL
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Nenhuma informação sensível deverá ser versionada no repositório.

---

## Banco de Dados

O banco de dados deverá possuir mecanismos de backup e recuperação.

As migrações serão controladas utilizando Prisma Migrate.

Mudanças estruturais deverão ocorrer exclusivamente através das migrações.

---

## Deploy

Todo deploy deverá seguir um processo padronizado.

Fluxo esperado:

```text
GitHub
     │
     ▼
Build
     │
     ▼
Testes
     │
     ▼
Deploy
```

Sempre que possível, o deploy deverá ser automatizado.

---

## Rollback

Em caso de falha durante uma nova versão, deverá ser possível retornar rapidamente para a versão anterior.

O processo de rollback será definido conforme a plataforma de hospedagem escolhida.

---