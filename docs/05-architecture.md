# Architecture

## Visão Geral

O sistema será desenvolvido utilizando uma arquitetura de **Monólito Modular**, separando responsabilidades por módulos e camadas. Essa abordagem oferece simplicidade para um MVP, facilita a manutenção e permite evoluir a aplicação conforme o crescimento do projeto.

---

## Arquitetura Geral

```text
Cliente
   │
   ▼
Frontend (Next.js)
   │
   ▼
API REST (Node.js + Express)
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
PostgreSQL
```

---

## Frontend

O frontend será desenvolvido utilizando **Next.js**, seguindo o App Router.

### Estrutura

```text
src/
│
├── app/
├── components/
├── contexts/
├── hooks/
├── services/
├── types/
├── utils/
├── styles/
├── constants/
└── assets/
```

### Responsabilidades

- Interface do usuário
- Consumo da API
- Gerenciamento de estado
- Validação de formulários
- Navegação
- Autenticação

---

## Backend

O backend seguirá uma arquitetura em camadas.

### Estrutura

```text
src/
│
├── config/
├── controllers/
├── middlewares/
├── repositories/
├── routes/
├── schemas/
├── services/
├── types/
├── utils/
└── validators/
```

### Fluxo da Requisição

```text
Request

↓

Route

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

PostgreSQL
```

### Responsabilidades

#### Routes

Definem os endpoints da API.

#### Controllers

Recebem as requisições HTTP e retornam as respostas.

#### Services

Contêm toda a regra de negócio da aplicação.

#### Repositories

Realizam a comunicação com o banco de dados.

#### Middlewares

Executam validações e autenticação antes dos controllers.

#### Validators / Schemas

Validam os dados recebidos pela API.

#### Utils

Funções reutilizáveis.

---

## Banco de Dados

Será utilizado PostgreSQL.

Principais entidades previstas:

- Users
- Addresses
- Categories
- Products
- Product Images
- Cart
- Cart Items
- Orders
- Order Items

A modelagem detalhada será documentada em `06-database.md`.

---

## Comunicação

A comunicação entre frontend e backend será realizada através de uma API REST utilizando JSON.

---

## Autenticação

Será utilizada autenticação baseada em:

- JWT (Access Token)
- Refresh Token
- Hash de senhas utilizando bcrypt

---

## Testes

O projeto possuirá três níveis de testes:

- Testes Unitários
- Testes de Integração
- Testes End-to-End

---

## Deploy

### Frontend

- Vercel

### Backend

- Railway (provisório)

### Banco de Dados

- Neon PostgreSQL

---

## Escalabilidade

Embora o projeto seja inicialmente um Monólito Modular, sua organização permitirá futura evolução para microsserviços, caso necessário, sem grandes alterações na estrutura da aplicação.