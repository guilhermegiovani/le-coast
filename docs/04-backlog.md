# Product Backlog

Este documento organiza o backlog do projeto Le Coast por Sprint.

Os itens devem ser atualizados conforme o andamento do projeto:

- [ ] Pendente
- [x] Concluído
- [~] Em andamento

---

# Sprint 1 - Fundação do Projeto

## Objetivo

Preparar a estrutura inicial do monorepo, configurar os projetos e estabelecer os padrões técnicos do desenvolvimento.

## Critérios de Aceite

- Monorepo configurado.
- Frontend iniciado corretamente.
- Backend iniciado corretamente.
- Banco de dados conectado.
- Padronização de código configurada.
- Pipeline inicial funcionando.
- Infraestrutura inicial de testes configurada.

## Definition of Done

- Código revisado.
- Lint executado sem erros.
- Build executado com sucesso.
- Testes relacionados à Sprint aprovados.
- Documentação atualizada.
- Alterações versionadas em branch apropriada.

### Tarefas

- [x] BK001 - Criar estrutura inicial do monorepo
- [ ] BK002 - Configurar projeto Backend
- [x] BK003 - Configurar projeto Frontend
- [ ] BK004 - Configurar PostgreSQL
- [ ] BK005 - Configurar Docker
- [x] BK006 - Configurar ESLint
- [ ] BK007 - Configurar Prettier
- [ ] BK008 - Configurar Husky
- [ ] BK009 - Configurar GitHub Actions
- [x] BK010 - Criar documentação de instruções para IA
- [x] BK011 - Criar documentação inicial do projeto
- [x] BK012 - Configurar Vitest e React Testing Library
- [x] BK013 - Configurar cobertura de testes
- [x] BK014 - Autorizar build do esbuild no pnpm
- [ ] BK015 - Criar estrutura compartilhada de variáveis de ambiente
- [ ] BK016 - Documentar comandos principais do monorepo

---

# Sprint 2 - Layout Global e Home

## Objetivo

Criar a base visual pública da loja e os componentes globais reutilizáveis.

## Critérios de Aceite

- Layout global renderizado corretamente.
- Cabeçalho e rodapé responsivos.
- Navegação principal disponível.
- Página inicial estruturada.
- Componentes básicos acessíveis.
- Testes dos componentes globais aprovados.

## Definition of Done

- Código revisado.
- Lint executado sem erros.
- Build executado com sucesso.
- Testes aprovados.
- Responsividade validada.
- Navegação por teclado validada.
- Documentação atualizada.

### Tarefas

- [x] BK017 - Criar componente Container
- [x] BK018 - Criar AnnouncementBar
- [x] BK019 - Criar Logo
- [x] BK020 - Criar Navigation
- [x] BK021 - Criar HeaderActions
- [x] BK022 - Criar Header
- [x] BK023 - Criar Footer
- [x] BK024 - Integrar componentes ao RootLayout
- [~] BK025 - Implementar navegação mobile
- [x] BK026 - Criar seção Hero da Home
- [x] BK027 - Criar seção de categorias em destaque
- [x] BK028 - Criar seção de produtos em destaque
- [x] BK029 - Criar seção institucional da Home
- [x] BK030 - Criar newsletter
- [ ] BK031 - Criar skip link de acessibilidade
- [x] BK032 - Validar responsividade do layout global
- [x] TEST-001 - Criar testes unitários dos componentes globais
- [ ] TEST-002 - Criar teste de integração do RootLayout
- [ ] A11Y-001 - Validar acessibilidade básica do layout global

### Critérios do TEST-002

- Renderizar AnnouncementBar.
- Renderizar Header.
- Renderizar o conteúdo recebido por `children`.
- Renderizar Footer.

### Critérios do A11Y-001

- Configurar axe para Vitest.
- Validar os componentes globais.
- Validar a Home.
- Documentar as limitações dos testes automatizados.
- Realizar validação manual por teclado.

---

# Sprint 3 - Autenticação

## Objetivo

Implementar autenticação e gerenciamento básico de contas de usuários.

## Critérios de Aceite

- Cadastro funcionando.
- Login funcionando.
- Sessão autenticada funcionando.
- Logout funcionando.
- Recuperação de senha disponível.
- Rotas privadas protegidas.

## Definition of Done

- Código revisado.
- Testes unitários e de integração aprovados.
- Fluxos de erro validados.
- Senhas armazenadas com segurança.
- Documentação da API atualizada.

### Tarefas

- [ ] BK033 - Criar tabela de usuários
- [ ] BK034 - Criar endpoint de cadastro
- [ ] BK035 - Criar endpoint de login
- [ ] BK036 - Implementar autenticação JWT
- [ ] BK037 - Implementar renovação ou validação de sessão
- [ ] BK038 - Implementar logout
- [ ] BK039 - Implementar recuperação de senha
- [ ] BK040 - Criar tela de Login
- [ ] BK041 - Criar tela de Cadastro
- [ ] BK042 - Criar tela de recuperação de senha
- [ ] BK043 - Proteger rotas privadas
- [ ] BK044 - Criar testes do fluxo de autenticação
- [ ] BK045 - Validar segurança básica da autenticação

---

# Sprint 4 - Catálogo de Produtos

## Objetivo

Disponibilizar o catálogo de produtos para navegação, pesquisa e consulta.

## Critérios de Aceite

- Produtos cadastrados.
- Categorias funcionando.
- Pesquisa funcionando.
- Filtros funcionando.
- Paginação funcionando.
- Página de detalhes disponível.

## Definition of Done

- Código revisado.
- Testes aprovados.
- Estados de carregamento e erro implementados.
- Responsividade validada.
- Documentação da API atualizada.

### Tarefas

- [ ] BK046 - Criar tabela de categorias
- [ ] BK047 - Criar tabela de produtos
- [ ] BK048 - Criar tabela de imagens dos produtos
- [ ] BK049 - Criar variações de produto por tamanho e cor
- [ ] BK050 - Criar CRUD de categorias
- [ ] BK051 - Criar CRUD de produtos
- [ ] BK052 - Criar listagem pública de produtos
- [ ] BK053 - Implementar pesquisa
- [ ] BK054 - Implementar filtros
- [ ] BK055 - Implementar ordenação
- [ ] BK056 - Implementar paginação
- [ ] BK057 - Criar página de detalhes do produto
- [ ] BK058 - Criar galeria de imagens do produto
- [ ] BK059 - Implementar seleção de tamanho e cor
- [ ] BK060 - Implementar favoritos
- [ ] BK061 - Criar testes do catálogo

---

# Sprint 5 - Carrinho

## Objetivo

Permitir que o cliente monte e gerencie seu carrinho de compras.

## Critérios de Aceite

- Produtos adicionados ao carrinho.
- Quantidade alterável.
- Produtos removíveis.
- Subtotal e total calculados corretamente.
- Carrinho persistido.
- Estoque validado.

## Definition of Done

- Código revisado.
- Testes aprovados.
- Regras de estoque validadas.
- Estados vazios e de erro implementados.
- Responsividade validada.

### Tarefas

- [ ] BK062 - Criar estrutura de dados do carrinho
- [ ] BK063 - Adicionar produto ao carrinho
- [ ] BK064 - Alterar quantidade dos produtos
- [ ] BK065 - Remover produtos
- [ ] BK066 - Limpar carrinho
- [ ] BK067 - Calcular subtotal
- [ ] BK068 - Calcular valor total
- [ ] BK069 - Persistir carrinho
- [ ] BK070 - Validar disponibilidade em estoque
- [ ] BK071 - Criar página do carrinho
- [ ] BK072 - Criar testes do carrinho

---

# Sprint 6 - Checkout e Pedidos

## Objetivo

Permitir que o cliente finalize uma compra e acompanhe seus pedidos.

## Critérios de Aceite

- Endereço preenchido e validado.
- Frete calculado.
- Pagamento processado.
- Pedido salvo.
- Estoque atualizado.
- Histórico de pedidos disponível.

## Definition of Done

- Código revisado.
- Testes aprovados.
- Fluxos de erro e falha de pagamento validados.
- Dados sensíveis protegidos.
- Documentação atualizada.

### Tarefas

- [ ] BK073 - Criar tabela de endereços
- [ ] BK074 - Criar tabela de pedidos
- [ ] BK075 - Criar tabela de itens do pedido
- [ ] BK076 - Criar fluxo de checkout
- [ ] BK077 - Implementar cadastro e seleção de endereço
- [ ] BK078 - Implementar cálculo de frete
- [ ] BK079 - Integrar gateway de pagamento
- [ ] BK080 - Criar pedido após confirmação do pagamento
- [ ] BK081 - Atualizar estoque após compra
- [ ] BK082 - Criar confirmação do pedido
- [ ] BK083 - Criar histórico de pedidos
- [ ] BK084 - Criar página de detalhes do pedido
- [ ] BK085 - Implementar atualização de status
- [ ] BK086 - Criar testes do checkout e pedidos

---

# Sprint 7 - Painel Administrativo

## Objetivo

Permitir que administradores gerenciem produtos, estoque, clientes e pedidos.

## Critérios de Aceite

- Acesso restrito a administradores.
- Produtos gerenciáveis.
- Categorias gerenciáveis.
- Estoque controlado.
- Pedidos gerenciáveis.
- Indicadores principais exibidos.

## Definition of Done

- Código revisado.
- Testes aprovados.
- Autorização administrativa validada.
- Fluxos de erro implementados.
- Documentação atualizada.

### Tarefas

- [ ] BK087 - Implementar perfil e autorização de administrador
- [ ] BK088 - Criar layout administrativo
- [ ] BK089 - Criar dashboard administrativo
- [ ] BK090 - Criar gerenciamento de produtos
- [ ] BK091 - Criar gerenciamento de categorias
- [ ] BK092 - Criar gerenciamento de estoque
- [ ] BK093 - Criar gerenciamento de pedidos
- [ ] BK094 - Criar gerenciamento de clientes
- [ ] BK095 - Criar upload de imagens
- [ ] BK096 - Criar testes do painel administrativo

---

# Sprint 8 - Qualidade e Segurança

## Objetivo

Reforçar a estabilidade, segurança, acessibilidade e desempenho do sistema.

## Critérios de Aceite

- Fluxos críticos cobertos por testes E2E.
- Cobertura mínima de testes atingida.
- Vulnerabilidades críticas corrigidas.
- Acessibilidade revisada.
- Desempenho validado.

## Definition of Done

- Todos os testes aprovados.
- Bugs críticos corrigidos.
- Auditorias registradas.
- Documentação atualizada.

### Tarefas

- [ ] TEST-003 - Definir meta mínima de cobertura
- [ ] TEST-004 - Criar testes E2E dos fluxos principais
- [ ] TEST-005 - Testar fluxo completo de autenticação
- [ ] TEST-006 - Testar fluxo completo de compra
- [ ] TEST-007 - Testar fluxo administrativo
- [ ] PERF-001 - Realizar testes de performance do frontend
- [ ] PERF-002 - Realizar testes de carga da API
- [ ] SEC-001 - Revisar autenticação e autorização
- [ ] SEC-002 - Revisar validação e sanitização de dados
- [ ] SEC-003 - Revisar dependências vulneráveis
- [ ] A11Y-002 - Realizar auditoria completa de acessibilidade
- [ ] A11Y-003 - Validar navegação por teclado
- [ ] A11Y-004 - Validar contraste e leitores de tela

---

# Sprint 9 - Deploy e Observabilidade

## Objetivo

Publicar a aplicação em produção e garantir sua observabilidade.

## Critérios de Aceite

- Frontend disponível online.
- Backend disponível online.
- Banco de produção configurado.
- HTTPS ativo.
- Logs disponíveis.
- Monitoramento ativo.
- Processo de rollback documentado.

## Definition of Done

- Deploy validado.
- Smoke tests aprovados.
- Monitoramento validado.
- Documentação de produção atualizada.

### Tarefas

- [ ] BK097 - Configurar ambiente de produção
- [ ] BK098 - Configurar banco de produção
- [ ] BK099 - Publicar Backend
- [ ] BK100 - Publicar Frontend
- [ ] BK101 - Configurar domínio
- [ ] BK102 - Configurar variáveis de ambiente
- [ ] BK103 - Executar migrations em produção
- [ ] BK104 - Configurar logs
- [ ] BK105 - Configurar monitoramento
- [ ] BK106 - Configurar alertas
- [ ] BK107 - Criar health check
- [ ] BK108 - Documentar rollback
- [ ] BK109 - Executar smoke tests em produção