# Database

## Objetivo

Documentar a estrutura do banco de dados, relacionamentos entre entidades e regras de negócio relacionadas aos dados.

---

## Banco de Dados

- PostgreSQL

ORM:

- Prisma

---

## Entidades

- Users
- Addresses
- Categories
- Products
- ProductVariants
- Sizes
- Colors
- ProductImages
- VariantImages
- Cart
- CartItems
- Orders
- OrderAddresses
- OrderItems

---

## Users

(iremos preencher quando voltarmos para Users)

---

## Addresses

### Descrição

Representa os endereços cadastrados pelos usuários para entrega de pedidos.

### Campos

| Campo        | Tipo     | Obrigatório | Descrição                              |
|--------------|----------|-------------|----------------------------------------|
| id           | UUID     | Sim         | Identificador único                    |
| userId       | UUID     | Sim         | Usuário proprietário do endereço       |
| name         | String   | Sim         | Nome do endereço (Casa, Trabalho etc.) |
| street       | String   | Sim         | Rua                                    |
| number       | String   | Sim         | Número                                 |
| complement   | String   | Não         | Complemento                            |
| neighborhood | String   | Sim         | Bairro                                 |
| city         | String   | Sim         | Cidade                                 |
| state        | String   | Sim         | Estado                                 |
| zipCode      | String   | Sim         | CEP                                    |
| country      | String   | Sim         | País                                   |
| isDefault    | Boolean  | Sim         | Define endereço principal              |
| createdAt    | DateTime | Sim         | Data de criação                        |
| updatedAt    | DateTime | Sim         | Data de atualização                    |

### Regras

- Um usuário pode possuir vários endereços.
- Um endereço pertence a apenas um usuário.
- Apenas um endereço pode ser definido como principal por usuário.
- O endereço deve possuir informações necessárias para entrega.

---

## Categories

### Descrição

Representa as categorias e subcategorias utilizadas para organizar os produtos da Le Coast.

### Campos

| Campo     | Tipo     | Obrigatório | Descrição                         |
|-----------|----------|-------------|-----------------------------------|
| id        | UUID     | Sim         | Identificador único               |
| name      | String   | Sim         | Nome da categoria                 |
| slug      | String   | Sim         | Identificador amigável para URL   |
| parentId  | UUID     | Não         | Categoria pai                     |
| isActive  | Boolean  | Sim         | Controle de exibição              |
| createdAt | DateTime | Sim         | Data de criação                   |
| updatedAt | DateTime | Sim         | Data de atualização               |

### Regras

- Uma categoria pode possuir uma categoria pai.
- Uma categoria pode possuir várias subcategorias.
- Categorias inativas não devem ser exibidas aos clientes.
- O nome da categoria deve ser único.

---

## Products

### Descrição

Representa os produtos da Le Coast. Um produto representa o modelo da peça, enquanto suas variações representam as combinações vendáveis de tamanho, cor e estoque.

### Campos

| Campo      | Tipo     | Obrigatório | Descrição                       |
|------------|----------|-------------|---------------------------------|
| id         | UUID     | Sim         | Identificador único             |
| categoryId | UUID     | Sim         | Categoria principal do produto  |
| name       | String   | Sim         | Nome do produto                 |
| slug       | String   | Sim         | Identificador amigável para URL |
| description| Text     | Não         | Descrição detalhada             |
| isActive   | Boolean  | Sim         | Controle de disponibilidade     |
| createdAt  | DateTime | Sim         | Data de criação                 |
| updatedAt  | DateTime | Sim         | Data de atualização             |

### Regras

- Um produto pertence a uma única categoria principal.
- Uma categoria pode possuir vários produtos.
- Um produto pode possuir várias variações.
- Produtos inativos não devem ser exibidos aos clientes.
- O slug deve ser único.
- Um produto precisa possuir pelo menos uma variação para estar disponível para venda.

---

## ProductVariants

### Descrição

Representa as variações vendáveis dos produtos, contendo características como tamanho, cor, preço, estoque e SKU.

### Campos

| Campo     | Tipo     | Obrigatório | Descrição                         |
|-----------|----------|-------------|-----------------------------------|
| id        | UUID     | Sim         | Identificador único               |
| productId | UUID     | Sim         | Produto relacionado               |
| sizeId    | UUID     | Sim         | Tamanho da variação               |
| colorId   | UUID     | Sim         | Cor da variação                   |
| sku       | String   | Sim         | Código único da variação          |
| price     | Decimal  | Sim         | Preço da variação                 |
| stock     | Integer  | Sim         | Quantidade disponível em estoque  |
| isActive  | Boolean  | Sim         | Controle de disponibilidade       |
| createdAt | DateTime | Sim         | Data de criação                   |
| updatedAt | DateTime | Sim         | Data de atualização               |

### Regras

- Cada variação pertence a um único produto.
- Uma variação deve possuir tamanho e cor definidos.
- O SKU deve ser único.
- O estoque deve ser controlado por variação.
- Apenas variações ativas podem ser vendidas.

---

## ProductImages

### Descrição

Representa as imagens gerais utilizadas pelos produtos, como fotos de coleção, divulgação e apresentação da peça.

### Campos

| Campo     | Tipo     | Obrigatório | Descrição                     |
|-----------|----------|-------------|-------------------------------|
| id        | UUID     | Sim         | Identificador único            |
| productId | UUID     | Sim         | Produto relacionado            |
| url       | String   | Sim         | URL da imagem                  |
| altText   | String   | Não         | Texto alternativo da imagem    |
| position  | Integer  | Sim         | Ordem de exibição              |
| isPrimary | Boolean  | Sim         | Define imagem principal        |
| createdAt | DateTime | Sim         | Data de criação                |
| updatedAt | DateTime | Sim         | Data de atualização             |

### Regras

- Toda imagem deve estar vinculada a um produto.
- Uma imagem pode ser definida como principal.
- A ordem das imagens deve ser configurável.
- As imagens devem ser armazenadas em serviço externo de arquivos.

---

## VariantImages

### Descrição

Representa as imagens específicas de uma variação do produto, permitindo exibir imagens diferentes conforme cor ou outras características da variante.

### Campos

| Campo     | Tipo     | Obrigatório | Descrição                     |
|-----------|----------|-------------|-------------------------------|
| id        | UUID     | Sim         | Identificador único            |
| variantId | UUID     | Sim         | Variação relacionada           |
| url       | String   | Sim         | URL da imagem                  |
| altText   | String   | Não         | Texto alternativo da imagem    |
| position  | Integer  | Sim         | Ordem de exibição              |
| isPrimary | Boolean  | Sim         | Define imagem principal        |
| createdAt | DateTime | Sim         | Data de criação                |
| updatedAt | DateTime | Sim         | Data de atualização             |

### Regras

- Toda imagem deve estar vinculada a uma variação.
- Uma variação pode possuir várias imagens.
- Uma imagem pode ser definida como principal.
- A ordem das imagens deve ser configurável.
- As imagens devem ser armazenadas em serviço externo de arquivos.

---

## Cart

### Descrição

Representa o carrinho persistente de um usuário autenticado.

### Campos

| Campo     | Tipo     | Obrigatório | Descrição              |
|-----------|----------|-------------|------------------------|
| id        | UUID     | Sim         | Identificador único    |
| userId    | UUID     | Sim         | Usuário dono do carrinho |
| createdAt | DateTime | Sim         | Data de criação        |
| updatedAt | DateTime | Sim         | Data de atualização    |

### Regras

- Cada usuário possui um carrinho ativo.
- O carrinho pode possuir vários itens.
- O carrinho deve ser atualizado ao adicionar, remover ou alterar produtos.
- Carrinhos de visitantes são armazenados no navegador e sincronizados após autenticação.

---

## CartItems

### Descrição

Representa os produtos adicionados ao carrinho, armazenando a variação escolhida e a quantidade.

### Campos

| Campo     | Tipo     | Obrigatório | Descrição                   |
|-----------|----------|-------------|-----------------------------|
| id        | UUID     | Sim         | Identificador único         |
| cartId    | UUID     | Sim         | Carrinho relacionado        |
| variantId | UUID     | Sim         | Variação escolhida          |
| quantity  | Integer  | Sim         | Quantidade do item          |
| unitPrice | Decimal  | Sim         | Preço no momento da inclusão |
| createdAt | DateTime | Sim         | Data de criação             |
| updatedAt | DateTime | Sim         | Data de atualização         |

### Regras

- Uma mesma variação não deve existir duplicada no mesmo carrinho.
- A quantidade deve ser maior que zero.
- A quantidade não pode ultrapassar o estoque disponível.
- O preço armazenado representa o valor no momento em que o item foi adicionado.

---

## Orders

### Descrição

Representa os pedidos realizados pelos clientes. Um pedido mantém o histórico da compra no momento em que ela foi realizada, independentemente de alterações futuras nos produtos.

### Campos

| Campo            | Tipo     | Obrigatório | Descrição                         |
|------------------|----------|-------------|-----------------------------------|
| id               | UUID     | Sim         | Identificador único               |
| userId           | UUID     | Sim         | Cliente responsável pelo pedido   |
| status           | Enum     | Sim         | Status atual do pedido            |
| paymentStatus    | Enum     | Sim         | Status do pagamento               |
| paymentGateway   | String   | Não         | Gateway utilizado no pagamento    |
| paymentId        | String   | Não         | Identificador do pagamento        |
| totalAmount      | Decimal  | Sim         | Valor total do pedido             |
| createdAt        | DateTime | Sim         | Data de criação                   |
| updatedAt        | DateTime | Sim         | Data de atualização               |

### Status do pedido

- PENDING
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED

### Status do pagamento

- PENDING
- PAID
- FAILED
- REFUNDED

### Regras

- Um pedido pertence a um único usuário.
- Um usuário pode possuir vários pedidos.
- O pedido deve manter o histórico da compra.
- Alterações futuras nos produtos não devem modificar pedidos existentes.
- Apenas pedidos pagos podem avançar para processamento.

---

## OrderAddresses

### Descrição

Representa o endereço de entrega utilizado em um pedido. Os dados são armazenados como uma cópia do endereço no momento da compra para preservar o histórico do pedido.

### Campos

| Campo        | Tipo     | Obrigatório | Descrição                      |
|--------------|----------|-------------|--------------------------------|
| id           | UUID     | Sim         | Identificador único            |
| orderId      | UUID     | Sim         | Pedido relacionado             |
| name         | String   | Sim         | Nome do destinatário           |
| street       | String   | Sim         | Rua                            |
| number       | String   | Sim         | Número                         |
| complement   | String   | Não         | Complemento                    |
| neighborhood | String   | Sim         | Bairro                         |
| city         | String   | Sim         | Cidade                         |
| state        | String   | Sim         | Estado                         |
| zipCode      | String   | Sim         | CEP                            |
| country      | String   | Sim         | País                           |
| createdAt    | DateTime | Sim         | Data de criação                |

### Regras

- Cada pedido possui um endereço de entrega.
- O endereço representa uma cópia dos dados no momento da compra.
- Alterações futuras no endereço do usuário não devem modificar pedidos existentes.

---

## OrderItems

### Descrição

Representa os produtos comprados dentro de um pedido. Armazena uma cópia das informações do produto no momento da compra para preservar o histórico.

### Campos

| Campo       | Tipo     | Obrigatório | Descrição                         |
|-------------|----------|-------------|-----------------------------------|
| id          | UUID     | Sim         | Identificador único               |
| orderId     | UUID     | Sim         | Pedido relacionado                |
| variantId   | UUID     | Sim         | Variação comprada                 |
| productName | String   | Sim         | Nome do produto no momento da compra |
| sizeName    | String   | Sim         | Tamanho comprado                  |
| colorName   | String   | Sim         | Cor comprada                      |
| unitPrice   | Decimal  | Sim         | Preço unitário no momento da compra |
| quantity    | Integer  | Sim         | Quantidade comprada               |
| subtotal    | Decimal  | Sim         | Valor total do item               |
| createdAt   | DateTime | Sim         | Data de criação                   |

### Regras

- Um pedido pode possuir vários itens.
- Cada item pertence a um único pedido.
- O item deve armazenar as informações do produto no momento da compra.
- O preço salvo não deve ser alterado após a criação do pedido.
- A quantidade deve ser maior que zero.

---

## Diagrama Entidade-Relacionamento (DER)

```text
Users
│
├── Addresses
│
├── Cart
│     │
│     └── CartItems
│             │
│             ▼
│      ProductVariants
│
└── Orders
      │
      ├── OrderAddresses
      │
      └── OrderItems
              │
              ▼
       ProductVariants


Categories
│
│ 1
▼
Products
│
├── ProductImages
│
└── ProductVariants
        │
        ├── VariantImages
        │
        ├── Colors
        │
        └── Sizes
```

---

## Relacionamentos

- **Users (1:N) Addresses**
  - Um usuário pode possuir vários endereços.

- **Users (1:1) Cart**
  - Cada usuário possui um carrinho persistente.

- **Users (1:N) Orders**
  - Um usuário pode realizar vários pedidos.

- **Categories (1:N) Products**
  - Uma categoria pode possuir vários produtos.

- **Products (1:N) ProductVariants**
  - Um produto pode possuir várias variações.

- **Products (1:N) ProductImages**
  - Um produto pode possuir imagens gerais.

- **ProductVariants (N:1) Sizes**
  - Cada variação possui um tamanho.

- **ProductVariants (N:1) Colors**
  - Cada variação possui uma cor.

- **ProductVariants (1:N) VariantImages**
  - Cada variação pode possuir imagens específicas.

- **Cart (1:N) CartItems**
  - Um carrinho pode possuir vários itens.

- **CartItems (N:1) ProductVariants**
  - Cada item representa uma variação do produto.

- **Orders (1:1) OrderAddresses**
  - Cada pedido possui um endereço de entrega.

- **Orders (1:N) OrderItems**
  - Um pedido pode possuir vários itens.

- **OrderItems (N:1) ProductVariants**
  - Cada item referencia a variação comprada e mantém o histórico da compra.

---

## Índices

### Users

- email (único)

### Categories

- slug (único)

### Products

- slug (único)

### ProductVariants

- sku (único)
- productId

### CartItems

- cartId + variantId (único)

### Orders

- userId
- createdAt
- paymentStatus
- status

---

## Regras de Negócio Gerais

Em definição.

As regras específicas de cada entidade serão documentadas dentro de suas respectivas seções.