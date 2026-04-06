# CONTEXT — IDASAM

Regras, stack e lógica de negócio. Leia antes de fazer qualquer alteração.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Express + TypeScript | 4.x |
| Frontend | React + Vite | 18 / 5 |
| ORM | Drizzle ORM | 0.39 |
| Banco | PostgreSQL serverless (Neon) | — |
| Autenticação | Token Bearer (admin) | — |
| UI | Tailwind CSS + Radix UI + shadcn/ui | 3.x |
| Roteamento frontend | Wouter | 3.x |
| Requisições | TanStack Query | 5.x |
| Formulários | React Hook Form + Zod | — |
| E-mail | Resend | — |
| Pagamentos | Stripe | — |
| Storage | Supabase Storage | — |
| PDF | pdf-lib + jsPDF | — |

---

## Lógica de Negócio

### Organização
- IDASAM = Instituto de Desenvolvimento Ambiental e Social da Amazônia
- Áreas: bioeconomia, educação, tecnologia verde, pesquisa científica, capacitação profissional

### Autenticação
- Admin: token Bearer gerado no login (`/api/auth/login`), válido por 8h, armazenado em `localStorage`
- Variáveis obrigatórias: `ADMIN_EMAIL` + `ADMIN_PASSWORD` no `.env`
- Sem essas variáveis, login admin fica **desabilitado**

### Cursos e Matrículas
- Cursos têm status: `open` | `closed` | `coming_soon` | `completed`
- Cada curso pode ter código de autenticação (`authCode`) para validação de certificados
- Inscrições em `/capacitacao` — públicas, sem login
- Certificados gerados em lote pelo admin ou consultados publicamente via `authCode`

### Banco de Dados
- Schema em `shared/schema.ts` — fonte única de verdade para tipos frontend e backend
- Para alterar o schema: editar `shared/schema.ts` → rodar `npm run db:push`
- **Nunca editar tabelas diretamente no Neon sem atualizar o schema**

---

## Regras para a IA

- **Nunca commitar** o arquivo `.env`
- **Sempre usar** `shared/schema.ts` como referência de tipos — não duplicar definições
- **Nunca rodar** `npm run db:push` sem confirmar com o usuário — afeta banco de produção
- Para novas rotas: adicionar em `server/routes.ts`, lógica de dados em `server/storage.ts`
- Para novos componentes UI: seguir padrão shadcn/ui com Tailwind
- Para novas páginas públicas: adicionar em `client/src/pages/` e registrar no `App.tsx` (Wouter)
- Para novas páginas do admin: adicionar em `client/src/pages/dashboard/`
- Sempre tipar com TypeScript — sem `any` desnecessário
