# Le Coast AI Instructions

Antes de gerar qualquer código, considere obrigatórias as decisões documentadas em:

- docs/architecture.md
- docs/coding-standards.md
- docs/database.md
- docs/api.md
- docs/testing.md
- docs/deployment.md

Esses documentos têm prioridade sobre qualquer sugestão da IA.

Caso exista conflito entre seu conhecimento e a documentação do projeto, siga a documentação do projeto.

> Este documento define as regras que toda IA deve seguir ao contribuir com o projeto Le Coast.

---

# Objetivo

Você faz parte da equipe de desenvolvimento da Le Coast.

Sua função é implementar funcionalidades seguindo rigorosamente os padrões existentes.

Você NÃO é responsável por definir arquitetura.

Você NÃO deve reinventar componentes existentes.

Sempre respeite as decisões previamente tomadas.

---

# Stack

Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- class-variance-authority (CVA)

Backend

- Node.js
- Express
- Prisma
- PostgreSQL

Monorepo

- pnpm

---

# Arquitetura

Nunca altere a arquitetura existente.

Nunca mova arquivos.

Nunca reorganize pastas.

Nunca sugira outra arquitetura durante uma implementação.

Caso exista alguma sugestão, coloque-a apenas no final da resposta.

---

# Estrutura

Frontend

```
src/
│
├── app/
├── components/
│   ├── ui/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   └── ...
│
├── lib/
├── services/
├── types/
└── utils/
```

Componentes em:

```
components/ui
```

devem permanecer totalmente genéricos.

Eles nunca podem conhecer regras de negócio.

---

# Componentes

Sempre preferir:

- Componentes pequenos
- Componentes reutilizáveis
- Componentes tipados

Utilizar:

```
cn()
```

para combinação de classes.

Utilizar:

```
CVA
```

quando existir variantes.

Sempre aceitar:

```
className
```

quando fizer sentido.

---

# Design System

Nunca utilizar:

- hexadecimal
- rgb()
- hsl()

Sempre utilizar Design Tokens.

Exemplos:

```
background
surface
foreground
muted
border

primary
secondary

success
warning
error
```

---

# Tailwind

Preferir classes utilitárias.

Não criar CSS separado sem necessidade.

---

# TypeScript

Sempre utilizar:

- interfaces
- tipos nativos do React

Exemplos:

```
HTMLAttributes
ButtonHTMLAttributes
InputHTMLAttributes
```

Evitar tipos desnecessários.

---

# Imports

Preferir imports absolutos.

Exemplo:

```
@/components/ui/button
```

Sempre utilizar:

- import type para tipos do TypeScript.
- Alias (@/) para imports internos.
- Não importar React quando não for necessário.

---

# Código

O código deve ser:

- simples
- legível
- reutilizável
- pequeno
- consistente

---

# Não fazer

Nunca:

- instalar dependências
- alterar package.json
- alterar configurações
- alterar prettier
- alterar eslint
- alterar tsconfig
- alterar globals.css
- modificar componentes existentes sem solicitação

Nunca criar:

- hooks desnecessários
- abstrações prematuras
- componentes gigantes
- lógica que não foi solicitada

---

# Implementações

Sempre implemente apenas o solicitado.

Nunca implemente funcionalidades extras.

Exemplo:

Se foi solicitado criar um Badge:

Crie apenas o Badge.

Não crie:

- Avatar
- Tooltip
- Toast
- Spinner

---

# Arquivos

Se a solicitação mencionar um arquivo específico:

Modifique apenas aquele arquivo.

Caso seja necessário alterar outro arquivo, informe antes.

---

# Bibliotecas

Nunca instalar novas bibliotecas.

Utilize apenas as dependências existentes.

---

# Responsividade

Todo componente deve ser pensado como:

- Mobile First

Compatível com:

- Mobile
- Tablet
- Desktop

---

# Acessibilidade

Sempre que possível:

- utilizar aria-*
- htmlFor
- id
- useId()

Não remover acessibilidade existente.

---

# Performance

Evitar:

- re-renderizações desnecessárias
- lógica complexa
- código duplicado

---

# Comentários

Não escrever comentários explicando código óbvio.

Só comentar quando realmente agregar valor.

---

# Sugestões

Caso exista alguma melhoria:

Não implemente.

Apenas escreva ao final:

## Sugestões

- sugestão 1
- sugestão 2

Nada mais.

---

Organizar os imports na seguinte ordem:

1. React / Next
2. Bibliotecas externas
3. Imports internos

--

# Regra mais importante

Implemente exatamente o que foi solicitado.

Nem mais.

Nem menos.