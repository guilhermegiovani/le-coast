# API

## Objetivo

Documentar a arquitetura, padrões, convenções e recursos da API da Le Coast.

A API será responsável por centralizar todas as regras de negócio da aplicação, servindo tanto o cliente Web quanto futuros clientes Mobile, garantindo consistência, segurança e escalabilidade.

---

## Arquitetura

A API seguirá uma arquitetura em camadas (Layered Architecture), separando responsabilidades para facilitar manutenção, testes e evolução do sistema.

```text
Controller
    │
    ▼
Service
    │
    ▼
Repository
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
```

### Responsabilidades

#### Controller

- Receber requisições HTTP.
- Validar dados básicos da requisição.
- Chamar os Services.
- Retornar a resposta ao cliente.

#### Service

- Implementar as regras de negócio.
- Orquestrar operações.
- Garantir consistência dos dados.

#### Repository

- Realizar acesso ao banco de dados.
- Centralizar consultas utilizando Prisma.

#### Prisma

- Mapear entidades da aplicação para o PostgreSQL.

---

## Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Cloudinary

---

## Versionamento

A API utilizará versionamento por URL.

Exemplo:

```text
/api/v1/products
```

Caso existam mudanças incompatíveis no futuro, uma nova versão poderá ser criada sem afetar clientes existentes.

Exemplo:

```text
/api/v2/products
```

---

## Convenções

### URLs

- Utilizar substantivos no plural.
- Utilizar letras minúsculas.
- Utilizar hífen apenas quando necessário.

Exemplos:

```text
/products
/categories
/orders
/cart
```

### Métodos HTTP

| Método  | Utilização              |
|---------|-------------------------|
| GET     | Consultar recursos      |
| POST    | Criar recursos          |
| PUT     | Atualizar completamente |
| PATCH   | Atualizar parcialmente  |
| DELETE  | Remover recursos        |

### Formato

Todas as requisições e respostas utilizarão JSON.

### Datas

Todas as datas serão armazenadas em UTC.

### Identificadores

Todas as entidades utilizarão UUID como chave primária.

---

## Autenticação

A autenticação será baseada em JSON Web Token (JWT).

Após realizar o login com sucesso, o cliente receberá um token JWT, que deverá ser enviado em todas as requisições protegidas através do cabeçalho HTTP:

```http
Authorization: Bearer <token>
```

O token será validado por um middleware antes da execução da rota.

### Papéis de usuário

A aplicação utilizará controle de acesso baseado em papéis (RBAC).

Papéis disponíveis:

- CUSTOMER
- ADMIN

### Permissões

#### CUSTOMER

- Gerenciar sua própria conta.
- Gerenciar seus endereços.
- Gerenciar seu carrinho.
- Realizar pedidos.
- Consultar seus próprios pedidos.

#### ADMIN

Além das permissões de CUSTOMER:

- Gerenciar categorias.
- Gerenciar produtos.
- Gerenciar variações.
- Gerenciar estoque.
- Gerenciar pedidos.
- Gerenciar usuários.
- Gerenciar imagens dos produtos.

### Rotas protegidas

Todas as rotas administrativas exigirão autenticação e permissão de ADMIN.

As rotas do cliente exigirão autenticação quando envolverem dados pessoais, carrinho ou pedidos.

Rotas públicas permanecerão acessíveis sem autenticação, como:

- Listagem de produtos.
- Listagem de categorias.
- Visualização de detalhes dos produtos.

---

### Tokens

A autenticação utilizará dois tipos de token:

| Token         | Finalidade                                 | Tempo de vida |
|---------------|--------------------------------------------|---------------|
| Access Token  | Autorizar requisições protegidas           | Curto         |
| Refresh Token | Gerar um novo Access Token automaticamente | Longo         |

O Access Token será enviado em todas as requisições protegidas através do cabeçalho HTTP.

O Refresh Token será utilizado apenas para renovar o Access Token quando este expirar.

O cliente não deverá solicitar um novo login enquanto possuir um Refresh Token válido.

---

## Fluxo de Autenticação

```text
Login
    │
    ▼
Validação das credenciais
    │
    ▼
Geração do Access Token
    │
    ▼
Geração do Refresh Token
    │
    ▼
Resposta ao cliente
    │
    ▼
Requisições autenticadas
    │
    ▼
Access Token expirou?
        │
      Sim
        │
        ▼
Envia Refresh Token
        │
        ▼
Novo Access Token
```

---

## Recursos

A API será organizada em recursos independentes, seguindo os princípios REST.

Cada recurso será responsável por um domínio específico da aplicação.

### Auth

Responsável pela autenticação e gerenciamento de sessão.

Principais responsabilidades:

- Login
- Logout
- Renovação do Access Token
- Recuperação de senha
- Alteração de senha
- Verificação de e-mail (futuro)

---

### Users

Responsável pelo gerenciamento dos usuários.

Principais responsabilidades:

- Cadastro
- Consulta do próprio perfil
- Atualização dos dados
- Alteração de senha
- Exclusão da conta (futuro)

---

### Addresses

Responsável pelo gerenciamento dos endereços dos usuários.

Principais responsabilidades:

- Cadastrar endereço
- Listar endereços
- Atualizar endereço
- Remover endereço
- Definir endereço principal

---

### Categories

Responsável pelas categorias dos produtos.

Principais responsabilidades:

- Listagem pública
- Cadastro
- Atualização
- Exclusão lógica
- Organização em categorias e subcategorias

---

### Products

Responsável pelo catálogo de produtos.

Principais responsabilidades:

- Listagem pública
- Consulta por slug
- Pesquisa
- Cadastro
- Atualização
- Exclusão lógica

---

### Product Variants

Responsável pelas variações comercializáveis dos produtos.

Principais responsabilidades:

- Cadastro
- Atualização
- Controle de estoque
- Alteração de preço
- Gerenciamento de SKU

---

### Cart

Responsável pelo carrinho do cliente.

Principais responsabilidades:

- Adicionar produto
- Alterar quantidade
- Remover produto
- Consultar carrinho

---

### Orders

Responsável pelos pedidos.

Principais responsabilidades:

- Criar pedido
- Consultar pedidos
- Consultar detalhes
- Atualizar status (ADMIN)
- Cancelamento

---

### Uploads

Responsável pelo gerenciamento de imagens.

Principais responsabilidades:

- Upload de imagens
- Remoção de imagens
- Associação das imagens aos produtos
- Associação das imagens às variações

---

## Padrão de Respostas

Todas as respostas da API utilizarão JSON.

### Resposta de sucesso

```json
{
  "success": true,
  "data": {}
}
```

Quando necessário, poderão ser incluídos campos adicionais, como paginação e metadados.

Exemplo:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 135,
    "totalPages": 7
  }
}
```

---

### Resposta de erro

Todas as respostas de erro seguirão o mesmo padrão.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os dados enviados são inválidos."
  }
}
```

Quando houver mais de um erro de validação:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os dados enviados são inválidos.",
    "details": [
      {
        "field": "email",
        "message": "E-mail inválido."
      },
      {
        "field": "password",
        "message": "A senha deve possuir pelo menos 8 caracteres."
      }
    ]
  }
}
```

---

## Códigos HTTP

| Código  | Significado                  | Utilização                                     |
|--------:|------------------------------|------------------------------------------------|
| 200     | OK                           | Requisição realizada com sucesso.              |
| 201     | Created                      | Recurso criado com sucesso.                    |
| 204     | No Content                   | Operação realizada sem retorno de conteúdo.    |
| 400     | Bad Request                  | Dados enviados são inválidos.                  |
| 401     | Unauthorized                 | Usuário não autenticado.                       |
| 403     | Forbidden                    | Usuário sem permissão.                         |
| 404     | Not Found                    | Recurso não encontrado.                        |
| 409     | Conflict                     | Conflito de dados (ex.: e-mail já cadastrado). |
| 422     | Unprocessable Entity         | Erro de validação de regras de negócio.        |
| 429     | Too Many Requests            | Limite de requisições excedido.                |
| 500     | Internal Server Error        | Erro interno da aplicação.                     |

---

## Paginação

Os endpoints de listagem deverão suportar paginação.

### Parâmetros

| Parâmetro  | Tipo    | Obrigatório | Descrição                            |
|------------|---------|-------------|--------------------------------------|
| page       | Integer | Não         | Página atual (padrão: 1).            |
| limit      | Integer | Não         | Quantidade de registros por página.  |

### Exemplo

```text
GET /api/v1/products?page=2&limit=20
```

### Resposta

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 153,
    "totalPages": 8
  }
}
```

---

## Filtros

Os endpoints poderão disponibilizar filtros específicos conforme o recurso consultado.

Exemplos:

```text
GET /api/v1/products?category=fitness
```

```text
GET /api/v1/products?color=preto
```

```text
GET /api/v1/products?size=M
```

```text
GET /api/v1/orders?status=PROCESSING
```

Cada recurso deverá documentar os filtros disponíveis.

---

## Ordenação

Os endpoints de listagem poderão suportar ordenação utilizando os parâmetros `sort` e `order`.

### Parâmetros

| Parâmetro | Tipo   | Obrigatório | Descrição                      |
|------------|--------|-------------|--------------------------------|
| sort       | String | Não         | Campo utilizado para ordenação. |
| order      | String | Não         | `asc` ou `desc`.               |

### Exemplos

```text
GET /api/v1/products?sort=price&order=asc
```

```text
GET /api/v1/products?sort=createdAt&order=desc
```

Na ausência desses parâmetros, cada endpoint utilizará uma ordenação padrão definida pela aplicação.

---

## Rate Limiting

Para aumentar a segurança da aplicação, a API poderá limitar a quantidade de requisições realizadas por um mesmo cliente em um determinado período.

Essa funcionalidade será aplicada principalmente em:

- Login
- Recuperação de senha
- Cadastro de usuários
- Endpoints públicos

A estratégia será definida durante a implementação.

---

## Webhooks

A API deverá suportar Webhooks para integração com serviços externos.

Inicialmente serão utilizados para:

- Confirmação de pagamentos.
- Atualização automática do status dos pedidos.

Novos Webhooks poderão ser adicionados conforme a evolução do projeto.