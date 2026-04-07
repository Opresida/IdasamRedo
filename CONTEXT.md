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
| PDF | pdf-lib + jsPDF + html2canvas | — |
| Preview PDF | react-pdf | — |
| QR Code | qrcode (npm) | — |

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

### Assinatura Digital (Lei 14.063/2020)
- Assinatura interna: admin seleciona signatário cadastrado → pdf-lib embutir página de autenticação no PDF
- Assinatura externa: gera link público `/assinar/:token` (7 dias) → signatário preenche nome, CPF, desenha assinatura
- Evidências capturadas: IP, user-agent, data/hora, hash SHA-256 do documento original
- Página de autenticação dedicada no final do PDF: QR Code, hash, link de validação, dados do signatário
- Validação pública: `/validar/:hash` — qualquer pessoa verifica autenticidade
- Trilha de auditoria: tabela `assinatura_logs` com todas as evidências
- Função compartilhada: `client/src/lib/pdf-auth-page.ts` — gera a página de autenticação no PDF

### Delegação de Poderes (Art. 22 Estatuto)
- Somente o Presidente pode criar delegações de poderes de assinatura
- Vice-Presidente pode assinar sem delegação formal (Parágrafo Único do Art. 22)
- Delegação tem: delegante, delegado, motivo, poderes específicos, período de validade
- Ato de Designação gerado automaticamente em PDF (`client/src/lib/pdf-ato-designacao.ts`)
- Na assinatura interna, sistema verifica se signatário tem poderes (cargo direto ou delegação ativa)
- Se for delegação, registra `delegacaoId` no log de auditoria
- Delegação pode ser revogada a qualquer momento pelo Presidente
- Tabela `delegacoes` armazena tudo; status: `ativa`, `revogada`, `expirada`

### Rascunhos Editáveis
- Documentos podem ser salvos como rascunho (`status: 'rascunho'`) sem gerar PDF
- Rascunhos aparecem na aba "Documentos Emitidos" com botão de edição (caneta)
- Ao editar: dados JSON do campo `dados` são carregados de volta no formulário correto
- Rascunho pode ser atualizado várias vezes antes de gerar o PDF final
- Ao gerar PDF, status muda de `rascunho` para `enviada`
- Funciona para todos os 5 tipos: contrato, orçamento, ofício, relatório, projeto

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
