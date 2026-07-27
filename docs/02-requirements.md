# Requirements

## Requisitos Funcionais (RF)

### Autenticação

- RF001 - O sistema deve permitir que o cliente crie uma conta utilizando nome, e-mail e senha.

- RF002 - O sistema deve permitir que o cliente realize login utilizando e-mail e senha.

- RF003 - O sistema deve permitir que o cliente encerre sua sessão (logout).

- RF004 - O sistema deve permitir que o cliente recupere sua senha.

---

### Perfil

- RF005 - O cliente deve poder visualizar seus dados cadastrais.

- RF006 - O cliente deve poder atualizar seus dados pessoais.

- RF007 - O cliente deve poder cadastrar múltiplos endereços.

---

### Produtos

- RF008 - O sistema deve listar todos os produtos disponíveis.

- RF009 - O sistema deve permitir pesquisar produtos.

- RF010 - O sistema deve permitir filtrar produtos por categoria.

- RF011 - O sistema deve exibir os detalhes de um produto.

---

### Carrinho

- RF012 - O cliente deve poder adicionar produtos ao carrinho.

- RF013 - O cliente deve poder remover produtos do carrinho.

- RF014 - O cliente deve poder alterar a quantidade dos produtos.

- RF015 - O sistema deve calcular automaticamente o valor total do carrinho.

---

### Pedidos

- RF016 - O cliente deve poder finalizar um pedido.

- RF017 - O sistema deve registrar os produtos comprados.

- RF018 - O cliente deve poder visualizar seu histórico de pedidos.

---

### Favoritos

- RF019 - O cliente deve poder favoritar produtos.

- RF020 - O cliente deve poder remover produtos dos favoritos.

---

### Administração

- RF021 - O administrador deve poder cadastrar produtos.

- RF022 - O administrador deve poder editar produtos.

- RF023 - O administrador deve poder remover produtos.

- RF024 - O administrador deve gerenciar categorias.

- RF025 - O administrador deve visualizar todos os pedidos.

- RF026 - O administrador deve atualizar o status dos pedidos.

- RF027 - O administrador deve gerenciar o estoque dos produtos.

---

## Requisitos Não Funcionais (RNF)

- RNF001 - O sistema deverá ser responsivo.

- RNF002 - O frontend será desenvolvido utilizando Next.js e TypeScript.

- RNF003 - O backend será desenvolvido utilizando Node.js e Express.

- RNF004 - O banco de dados será PostgreSQL.

- RNF005 - A autenticação utilizará JWT.

- RNF006 - As senhas serão armazenadas utilizando hash (bcrypt).

- RNF007 - O sistema deverá possuir testes automatizados.

- RNF008 - O sistema deverá seguir arquitetura em camadas.

- RNF009 - O sistema deverá utilizar Git para controle de versão.

- RNF010 - O deploy deverá ser realizado automaticamente através de CI/CD.

- RNF011 - As imagens dos produtos serão armazenadas em um serviço de armazenamento em nuvem.

- RNF012 - O sistema deverá registrar logs de erro.

- RNF013 - O sistema deverá ser compatível com os principais navegadores modernos.

- RNF014 - O sistema deverá seguir boas práticas de segurança para APIs REST.