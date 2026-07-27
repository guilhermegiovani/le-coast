# Database

## Objetivo

...

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
- ProductImages
- Cart
- CartItems
- Orders
- OrderItems

---

## Diagrama Entidade-Relacionamento (DER)

Users
│
├── Addresses
│
├── Cart
│     └── CartItems
│             │
│             ▼
│      ProductVariants
│
└── Orders
      └── OrderItems
              │
              ▼
       ProductVariants

Categories
│
└── Products
      │
      ├── ProductImages
      │
      └── ProductVariants

---

## Relacionamentos

Em definição.

---

## Índices

Em definição.

---

## Regras de Negócio

Em definição.