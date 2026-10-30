# NexoDesk

NexoDesk é uma central responsiva de chamados internos criada com Next.js. Permite acompanhar solicitações, aplicar filtros combinados, criar chamados, alterar status, consultar detalhes e excluir registros.

## Tecnologias

- Next.js 16 (App Router)
- React 19 e TypeScript
- Tailwind CSS 4
- React Hook Form e Zod
- Lucide React
- Sonner
- API Routes do Next.js com persistência local
- Vitest, React Testing Library e jsdom

## Executando localmente

1. Clone o repositório.
   ```bash
   git clone <url-do-repositorio>
   cd desafio
   ```
2. Instale as dependências.
   ```bash
   npm install
   ```
3. Inicie o servidor.
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000`.

## API mock

A API fica disponível em `/api/tickets` e persiste os dados em `data/tickets.json`.

- `GET /api/tickets`
- `GET /api/tickets/:id`
- `POST /api/tickets`
- `PATCH /api/tickets/:id`
- `DELETE /api/tickets/:id`

Ao remover `data/tickets.json`, os dados iniciais são recriados automaticamente.

## Testes

```bash
npm test
```

Validações adicionais:

```bash
npm run lint
npm run build
```

## Arquitetura

- `app/api/tickets`: API REST simulada com persistência em arquivo.
- `components/dashboard.tsx`: tela, estados, filtros, indicadores e operações.
- `components/ticket-form.tsx`: formulário validado com React Hook Form e Zod.
- `components/dialog.tsx`: modal reutilizável.
- `lib/tickets.ts`: tipos de domínio e opções compartilhadas.
- `lib/schema.ts`: regras de validação Zod.
- `lib/server-tickets.ts`: acesso aos dados persistidos pela API.

A busca usa debounce de 300 ms. Os contadores são derivados da lista carregada e a interface cobre loading, erro e estado vazio.

O projeto também inclui Dark Mode persistido no navegador, navegação por teclado, estados de foco visíveis e suporte a redução de movimento.
