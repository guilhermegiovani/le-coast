# Testing

## Objetivo

Documentar a estratégia de testes adotada na Le Coast, garantindo a qualidade, confiabilidade e estabilidade da aplicação durante todo o ciclo de desenvolvimento.

Os testes deverão assegurar que novas funcionalidades possam ser adicionadas sem comprometer funcionalidades já existentes.

---

## Estratégia de Testes

A estratégia de testes será baseada em diferentes níveis de validação, combinando testes automatizados e testes manuais.

Serão utilizados:

- Testes Unitários
- Testes de Integração
- Testes End-to-End (E2E)
- Testes Manuais

Cada tipo de teste possui responsabilidades específicas e complementares.

---

## Tipos de Testes

### Testes Unitários

Validam pequenas unidades da aplicação de forma isolada.

Exemplos:

- Funções utilitárias
- Regras de negócio
- Serviços
- Validações

---

### Testes de Integração

Validam a comunicação entre diferentes módulos da aplicação.

Exemplos:

- Controllers
- Services
- Repositories
- Banco de dados

---

### Testes End-to-End (E2E)

Simulam o comportamento do usuário utilizando a aplicação completa.

Exemplos:

- Login
- Cadastro
- Compra de um produto
- Checkout
- Painel administrativo

---

### Testes Manuais

Além dos testes automatizados, funcionalidades deverão ser verificadas manualmente durante o desenvolvimento para validar experiência do usuário e comportamento visual.

---

## Cobertura

O objetivo não é alcançar 100% de cobertura de código, mas garantir que as funcionalidades críticas da aplicação estejam devidamente testadas.

Prioridades:

- Autenticação
- Regras de negócio
- Pedidos
- Carrinho
- Pagamentos
- Controle de estoque

A cobertura poderá ser acompanhada durante o desenvolvimento para identificar áreas que necessitam de maior atenção.

---

## Ferramentas

| Ferramenta             | Finalidade                               |
|------------------------|------------------------------------------|
| Vitest                 | Testes unitários                         |
| React Testing Library  | Testes de componentes React              |
| Supertest              | Testes de integração da API              |
| Playwright             | Testes End-to-End (E2E)                  |

---

## Convenções

- Todo bug corrigido deverá possuir um teste correspondente, sempre que aplicável.
- Funcionalidades críticas deverão ser testadas antes do deploy.
- Os testes deverão possuir nomes descritivos.
- Os testes deverão ser independentes entre si.
- Sempre que possível, evitar dependências externas durante os testes.

---

## Testes Manuais

Durante o desenvolvimento serão realizados testes manuais para validar:

- Interface do usuário.
- Responsividade.
- Navegação.
- Fluxos de compra.
- Painel administrativo.
- Compatibilidade entre navegadores.

Os testes manuais complementam os testes automatizados, principalmente em aspectos relacionados à experiência do usuário.

---

## Testes Futuros

Conforme a evolução da Le Coast, poderão ser adicionados novos tipos de testes, como:

- Testes de performance.
- Testes de carga.
- Testes de segurança.
- Testes de acessibilidade.
- Testes de SEO.
- Testes automatizados em pipeline de CI/CD.