# Coding Standards

## Objetivo

Documentar os padrões de desenvolvimento utilizados na Le Coast para garantir consistência, legibilidade, facilidade de manutenção e colaboração entre os membros da equipe.

Todas as novas funcionalidades deverão seguir estes padrões.

---

## Princípios

Durante o desenvolvimento deverão ser seguidos os seguintes princípios:

- Código simples.
- Código legível.
- Baixo acoplamento.
- Alta coesão.
- Reutilização quando fizer sentido.
- Evitar duplicação de código (DRY).
- Evitar otimizações prematuras.
- Priorizar clareza em vez de complexidade.

---

## Estrutura de Pastas

O projeto seguirá a estrutura definida no documento de Arquitetura.

```text
clients/
    web/
    mobile/

server/

docs/
```

Cada aplicação será responsável apenas pelo seu próprio domínio.

---

## Convenções de Nomenclatura

| Elemento                 | Convenção      | Exemplo                    |
|--------------------------|----------------|----------------------------|
| Componentes React        | PascalCase     | ProductCard.tsx            |
| Hooks                    | camelCase      | useCart.ts                 |
| Funções                  | camelCase      | createOrder()              |
| Variáveis                | camelCase      | totalPrice                 |
| Interfaces               | PascalCase     | Product                    |
| Types                    | PascalCase     | OrderStatus                |
| Enums                    | PascalCase     | UserRole                   |
| Arquivos comuns          | kebab-case     | auth-service.ts            |
| Rotas da API             | kebab-case     | /product-variants          |
| Tabelas do banco         | snake_case     | product_variants           |
| Colunas do banco         | snake_case     | created_at                 |

---

## TypeScript

- Evitar o uso de `any`.
- Utilizar tipos explícitos quando necessário.
- Priorizar `interface` para objetos.
- Utilizar `type` para uniões e tipos derivados.
- Manter tipagem consistente em toda a aplicação.

---

## React

- Componentes devem possuir responsabilidade única.
- Evitar componentes excessivamente grandes.
- Utilizar Hooks para reutilização de lógica.
- Evitar lógica de negócio dentro dos componentes.
- Priorizar Server Components quando apropriado no Next.js.

---

## API

- Controllers não devem conter regras de negócio.
- Services concentram as regras de negócio.
- Repositories são responsáveis pelo acesso ao banco.
- Utilizar DTOs para entrada e saída de dados.
- Todas as respostas devem seguir o padrão definido em `07-api.md`.

---

## Banco de Dados

- Toda alteração estrutural deverá ocorrer por meio de migrações do Prisma.
- Não alterar diretamente o banco em produção.
- Utilizar chaves primárias UUID.
- Manter nomenclatura em `snake_case`.

---

## Git

- Commits pequenos e objetivos.
- Utilizar mensagens descritivas.
- Realizar commits frequentes.
- Evitar commits contendo código não relacionado.

Exemplos:

```text
feat: add authentication
fix: correct stock validation
docs: update database documentation
refactor: simplify cart service
```

---

## Comentários

Comentários deverão explicar decisões e regras de negócio quando necessário.

Evitar comentários que apenas descrevam o funcionamento de uma instrução simples.

O código deve ser suficientemente claro para reduzir a necessidade de comentários.

---

## Formatação

- Utilizar Prettier.
- Utilizar ESLint.
- Manter importações organizadas.
- Evitar código morto.
- Remover imports não utilizados.

---

## Boas Práticas

- Escrever código limpo.
- Priorizar legibilidade.
- Tratar erros adequadamente.
- Validar dados de entrada.
- Evitar duplicação de lógica.
- Criar funções pequenas e objetivas.
- Manter responsabilidades bem definidas.
- Escrever testes para funcionalidades críticas.