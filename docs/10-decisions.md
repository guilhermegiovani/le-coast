# Architecture Decision Records (ADR)

Este documento registra as principais decisões técnicas tomadas durante o desenvolvimento da Le Coast.

---

## ADR-001 - Arquitetura

### Status

Aceita

### Decisão

Utilizar uma arquitetura de Monólito Modular.

### Justificativa

A arquitetura oferece menor complexidade para o MVP, facilita a manutenção e permite evoluir a aplicação futuramente.

---

## ADR-002 - Frontend

### Status

Aceita

### Decisão

Utilizar Next.js.

### Justificativa

Oferece recursos modernos como App Router, Server Components, otimização de imagens e SEO.

---

## ADR-003 - Backend

### Status

Aceita

### Decisão

Utilizar Node.js com Express.

### Justificativa

Facilidade de desenvolvimento, grande comunidade e boa integração com TypeScript.

---

## ADR-004 - Banco de Dados

### Status

Aceita

### Decisão

Utilizar PostgreSQL.

### Justificativa

Banco de dados robusto, confiável e amplamente utilizado em aplicações web.

---

## ADR-005 - ORM

### Status

Aceita

### Decisão

Utilizar Prisma ORM.

### Justificativa

Excelente integração com TypeScript, produtividade elevada e documentação de qualidade.

---

## ADR-006 - Autenticação

### Status

Aceita

### Decisão

Utilizar JWT com Refresh Token.

### Justificativa

Maior segurança e melhor experiência para o usuário, permitindo renovação de sessões sem novo login.

---

## ADR-007 - Deploy

### Status

Aceita

### Decisão

Frontend na Vercel, Backend no Railway (provisório) e banco no Neon PostgreSQL.

### Justificativa

Facilidade de integração, baixo custo para o MVP e boa experiência de desenvolvimento.