# Product Backlog

Este documento organiza todas as tarefas do projeto por Sprint.

---

# Sprint 1 - Infraestrutura

## Objetivo

Preparar toda a infraestrutura do projeto para o início do desenvolvimento.

## Critérios de Aceite

- Ambiente configurado.
- Frontend e Backend iniciando corretamente.
- Banco conectado.
- Pipeline inicial funcionando.

## Definition of Done

- Código revisado.
- Testes executados.
- Documentação atualizada.

### Tarefas

- [ ] BK001 - Configurar projeto Backend
- [ ] BK002 - Configurar projeto Frontend
- [ ] BK003 - Configurar PostgreSQL
- [ ] BK004 - Configurar Docker
- [ ] BK005 - Configurar ESLint
- [ ] BK006 - Configurar Prettier
- [ ] BK007 - Configurar Husky
- [ ] BK008 - Configurar GitHub Actions

---

# Sprint 2 - Autenticação

## Objetivo

Implementar autenticação completa de usuários.

## Critérios de Aceite

- Cadastro funcionando.
- Login funcionando.
- JWT implementado.
- Logout funcionando.

## Definition of Done

- Código revisado.
- Testes passando.
- Documentação atualizada.

### Tarefas

- [ ] BK009 - Criar tabela de usuários
- [ ] BK010 - Criar endpoint de cadastro
- [ ] BK011 - Criar endpoint de login
- [ ] BK012 - Implementar autenticação JWT
- [ ] BK013 - Implementar recuperação de senha
- [ ] BK014 - Criar telas de Login e Cadastro
- [ ] BK015 - Criar testes da autenticação

---

# Sprint 3 - Catálogo de Produtos

## Objetivo

Disponibilizar o catálogo de produtos para navegação.

## Critérios de Aceite

- Produtos cadastrados.
- Pesquisa funcionando.
- Filtros funcionando.
- Página de detalhes pronta.

## Definition of Done

- Código revisado.
- Testes passando.
- Documentação atualizada.

### Tarefas

- [ ] BK016 - Criar tabela de produtos
- [ ] BK017 - Criar CRUD de produtos
- [ ] BK018 - Criar CRUD de categorias
- [ ] BK019 - Implementar pesquisa
- [ ] BK020 - Implementar filtros
- [ ] BK021 - Criar página de detalhes do produto
- [ ] BK022 - Implementar favoritos

---

# Sprint 4 - Carrinho

## Objetivo

Permitir que o cliente monte seu carrinho de compras.

## Critérios de Aceite

- Adicionar produtos.
- Alterar quantidade.
- Remover produtos.
- Valor total calculado corretamente.

## Definition of Done

- Código revisado.
- Testes passando.
- Documentação atualizada.

### Tarefas

- [ ] BK023 - Criar carrinho
- [ ] BK024 - Alterar quantidade dos produtos
- [ ] BK025 - Remover produtos
- [ ] BK026 - Calcular valor total
- [ ] BK027 - Persistir carrinho

---

# Sprint 5 - Checkout e Pedidos

## Objetivo

Permitir que o cliente finalize uma compra.

## Critérios de Aceite

- Checkout concluído.
- Pedido salvo.
- Histórico funcionando.

## Definition of Done

- Código revisado.
- Testes passando.
- Documentação atualizada.

### Tarefas

- [ ] BK028 - Criar fluxo de checkout
- [ ] BK029 - Criar tabela de pedidos
- [ ] BK030 - Criar histórico de pedidos
- [ ] BK031 - Atualizar status dos pedidos

---

# Sprint 6 - Painel Administrativo

## Objetivo

Permitir que administradores gerenciem a loja.

## Critérios de Aceite

- CRUD de produtos.
- Controle de estoque.
- Gestão de pedidos.

## Definition of Done

- Código revisado.
- Testes passando.
- Documentação atualizada.

### Tarefas

- [ ] BK032 - Criar dashboard administrativo
- [ ] BK033 - CRUD administrativo de produtos
- [ ] BK034 - Gerenciar pedidos
- [ ] BK035 - Controle de estoque

---

# Sprint 7 - Qualidade

## Objetivo

Garantir a qualidade e estabilidade do sistema.

## Critérios de Aceite

- Cobertura mínima de testes atingida.
- Fluxos principais validados.

## Definition of Done

- Todos os testes aprovados.
- Bugs críticos corrigidos.

### Tarefas

- [ ] BK036 - Criar testes unitários
- [ ] BK037 - Criar testes de integração
- [ ] BK038 - Criar testes E2E
- [ ] BK039 - Realizar testes de performance

---

# Sprint 8 - Deploy

## Objetivo

Publicar a aplicação em ambiente de produção.

## Critérios de Aceite

- Sistema disponível online.
- HTTPS configurado.
- Monitoramento ativo.

## Definition of Done

- Deploy validado.
- Documentação atualizada.

### Tarefas

- [ ] BK040 - Publicar Backend
- [ ] BK041 - Publicar Frontend
- [ ] BK042 - Configurar domínio
- [ ] BK043 - Configurar monitoramento