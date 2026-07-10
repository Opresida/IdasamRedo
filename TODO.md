# TODO — IDASAM

Lista de tarefas pendentes, melhorias planejadas e bugs conhecidos.

---

## Em andamento

- [ ] Configurar variáveis de ambiente das integrações externas (Stripe, Resend, Anthropic)

---

## Funcionalidades pendentes

### Alta prioridade
- [ ] Configurar `STRIPE_SECRET_KEY` e `VITE_STRIPE_PUBLISHABLE_KEY` para pagamentos
- [ ] Configurar `RESEND_API_KEY` para envio de e-mails
- [ ] **/dashboard/usuarios — Implementar backend completo** (página 100% mock, nada persiste)
  - [ ] BD: Adicionar campos `name`, `email`, `status`, `sectorId` na tabela `users`
  - [ ] BD: Criar tabela `sectors` (id, name, createdAt)
  - [ ] BD: Criar tabela `sector_permissions` (id, sectorId, permission, createdAt)
  - [ ] BD: Criar migration
  - [ ] API: CRUD `/api/admin/users` (GET, POST, PUT, DELETE)
  - [ ] API: CRUD `/api/admin/sectors` (GET, POST, PUT, DELETE)
  - [ ] Storage: `getAllUsers`, `updateUser`, `deleteUser`, CRUD setores/permissões
  - [ ] Frontend: Substituir mocks por `useQuery`/`useMutation` + loading/error states

### Média prioridade
- [ ] Testar fluxo completo de matrícula → certificado
- [ ] Testar geração de PDF dos certificados
- [ ] Consolidar 5 componentes de doação em 1-2 (economia ~25KB)
- [ ] Implementar proteção CSRF em operações POST/PUT/DELETE
- [ ] Sanitização de uploads (validar nomes, quota por usuário)
- [ ] Code splitting no SuiteDocumental.tsx (3.642 linhas, sem lazy loading)

### Baixa prioridade
- [ ] Documentar todas as rotas da API em `server/routes.ts`
- [ ] Adicionar testes automatizados
- [ ] Otimizar favicon.png (106KB → WebP)
- [ ] Acessibilidade: aria-labels em elementos interativos
- [ ] Validar variáveis de ambiente obrigatórias no startup do servidor

---

## Bugs conhecidos

- Nenhum registrado ainda.

---

## Concluído

- [x] **Modal de inscrição: campos obrigatórios + toggle "Vem de empresa?"** — no modal público (`enrollment-dialog.tsx`, `/capacitacao` e `/matricula`) todos os campos ficaram obrigatórios (Nome/CPF/Telefone/E-mail, com `*` e mensagens de erro) e o campo Empresa virou condicional: RadioGroup "Não/Sim" (default Não, fechado); marcar "Sim" revela o input Empresa e o torna obrigatório (`.refine`), voltar pra "Não" limpa valor+erro e envia `company` vazio. Validação client-side (não afeta cadastro admin nem import CSV; sem migração). Verificado E2E no navegador (obrigatoriedade, toggle, refine da empresa, submit 201 com empresa/CPF/telefone gravados; registro de teste removido) ✓ *2026-07-10*
- [x] **Relatórios em PDF no papel timbrado oficial (Capacitação)** — motor reaproveitável `client/src/lib/letterhead-pdf.ts` (cabeçalho/rodapé oficiais do Suite Documental via html2canvas+jsPDF; corpo em HTML com cores hex inline) + `client/src/lib/relatorios-capacitacao.ts`. (1) Botão **"Baixar Relatório"** na sub-aba Analytics → PDF dos indicadores + ranking de cursos + empresas no timbrado. (2) Botão **"Ficha do aluno"** (ícone FileDown) nas Ações de cada curso → PDF completo do aluno por CPF (dados pessoais, veio de empresa/qual, nº de inscrições/concluídos/certificados, se consta na lista de Notificações e seus cursos com status). Novo endpoint `GET /api/capacitacao/aluno?identifier=<cpf|email>` (`requireAdmin`) + `storage.getAlunoFicha`. Sem migração (só leitura/agregação). Typecheck sem erros novos ✓ *2026-07-10*
- [x] Clone e setup local do repositório
- [x] Instalação de dependências (`npm install`)
- [x] Correção de compatibilidade Windows (cross-env + --env-file)
- [x] Conexão com banco Neon via `DATABASE_URL`
- [x] Aplicação rodando localmente em `http://localhost:5000`
- [x] Criação dos arquivos de documentação (README, CONTEXT, TODO)
- [x] Configurar `ADMIN_EMAIL` e `ADMIN_PASSWORD` — login admin habilitado ✓ *2026-04-06*
- [x] Salvar PDF junto com documentos emitidos (base64 no banco) ✓ *2026-04-07*
- [x] Preview de PDF no modal com react-pdf ✓ *2026-04-07*
- [x] Download, envio por email e upload de PDF assinado ✓ *2026-04-07*
- [x] Timeline de ciclo de vida: Emitido → Assinado → Enviado ✓ *2026-04-07*
- [x] Sistema de assinatura digital interna (IDASAM) com pdf-lib + signatários cadastrados ✓ *2026-04-07*
- [x] Assinatura externa via link público (/assinar/:token) com canvas, CPF, IP e evidências ✓ *2026-04-07*
- [x] Página de autenticação dedicada no PDF com QR Code + hash SHA-256 + link de validação ✓ *2026-04-07*
- [x] Página pública de validação de documentos (/validar/:hash) ✓ *2026-04-07*
- [x] Referência à Lei 14.063/2020 e Regulamento eIDAS ✓ *2026-04-07*
- [x] Removido plugin Replit (vite-plugin-runtime-error-modal) ✓ *2026-04-07*
- [x] Módulo de delegação de poderes (Art. 22 Estatuto) com geração automática do Ato de Designação em PDF ✓ *2026-04-07*
- [x] Função estatutária nos signatários (presidente, vice_presidente, diretor_administrativo, outro) ✓ *2026-04-07*
- [x] Validação de poderes na assinatura interna (cargo direto ou delegação ativa) ✓ *2026-04-07*
- [x] Vice-Presidente pode assinar sem delegação formal (Parágrafo Único Art. 22) ✓ *2026-04-07*
- [x] Sistema de rascunhos editáveis para todos os tipos de documento (contrato, orçamento, ofício, relatório, projeto) ✓ *2026-04-07*
- [x] Rota PATCH /api/admin/proposals/:id para atualizar propostas existentes ✓ *2026-04-07*
- [x] Limpeza: deletar attached_assets/ (22MB), SQLs raiz, SVGs, componentes órfãos, fonts ✓ *2026-04-13*
- [x] Segurança: DOMPurify, bcrypt, rate limiting, error handling, console.logs ✓ *2026-04-13*
- [x] Infra: cache headers, auto-reload por versão, proteção Google Translate ✓ *2026-04-13*
- [x] **Importador de Proposta de Projeto via PDF (IA — Claude Sonnet 4.6)** — upload de PDF em folha A4 branca, extração automática de texto/tabelas/imagens e preenchimento do formulário de Projeto; fluxo manual preservado ✓ *2026-04-23*
- [x] Paginador de tabelas: tabelas grandes agora quebram linha a linha entre páginas repetindo o cabeçalho (`splitTableAcrossPages`) ✓ *2026-04-23*
- [x] Tracking local de uso da Anthropic API: tabela `anthropic_usage`, rota `/api/admin/anthropic-usage`, painel de saldo no modal com alertas e projeção de docs restantes ✓ *2026-04-23*
- [x] **Campo "Empresa" na inscrição + sub-aba Analytics da Capacitação** — coluna `enrollments.company` (opcional, tooltip de ajuda) em todos os cadastros (modal público, form admin, CSV, coluna na lista); nova aba Analytics com endpoint `GET /api/capacitacao/analytics` (certificados emitidos, alunos formados = pessoas distintas por CPF, cursos concluídos, matrículas com×sem empresa, ranking de cursos e de empresas). Validado E2E (238 certs / 159 formados distintos; inscrição com/sem empresa reflete nos contadores) ✓ *2026-07-03*
- [x] **Botão "Lista de Chamada" por curso (dashboard)** — gera a lista de presença do curso com os alunos cadastrados no modelo fixo (logo, metadados, tabela Nº/Nome/CPF/Assinatura, rodapé `www.idasam.org`), via `client/src/lib/lista-chamada.ts` + impressão por iframe oculto (Salvar como PDF). Validado renderizando o output real do util (idêntico ao modelo `output/chamada-fundamentos.html`) ✓ *2026-07-03*
- [x] **Analytics rastreia automações + "Adicionar todos" na audiência** — (1) automações (ex.: matrícula em curso) viram campanha de automação (`emailCampaigns.audienceId` nullable) agregada por template, com envio e abertura contabilizados (pixel c/ id da matrícula); rótulo "⚡ Automação" no painel. (2) endpoint bulk `POST /audiences/:id/leads/bulk` + botão "Adicionar todos" sobre os resultados filtrados (pula duplicados). Validado E2E ✓ *2026-07-03*
- [x] **Template de "Matrícula em Curso" direcionado por curso** — templates Markdown e HTML ganharam `courseId` (coluna aditiva); seletor de curso no painel aparece quando o gatilho é "Matrícula em Curso"; automação dispara o template do curso e cai num "coringa" (curso nulo = todos) quando não há específico. Validado E2E (criar/ler/apagar via API) ✓ *2026-07-03*
- [x] **Envio de e-mail agnóstico de provedor (SMTP via nodemailer + fallback Resend)** — função única `sendEmail()` decide o transporte por `.env`: se `SMTP_HOST` definido usa SMTP (Brevo/Mailjet/SMTP2GO/etc.), senão cai na Resend; suporta anexo (propostas em PDF). Trocar de provedor = editar `.env`, sem tocar no código. Mecanismo validado via SMTP de teste (Ethereal) com anexo ✓ *2026-07-03*
- [x] **Botão "Disparar Certificados" some quando todos já receberam** — vira selo "Certificados enviados" quando `certifiedCount >= enrolledCount`; `certifiedCount` derivado (certificados com `fileData`) exposto junto com `enrolledCount`; contadores atualizam ao vivo (invalidação de `/api/courses` em disparo/upload/import/add/delete) ✓ *2026-07-03*
- [x] **Matrícula via link + contagem de vagas (preenchidas × disponíveis)** — link público por curso (`/matricula/:courseId`, usa o `id` do curso, sem migração); página dedicada com vagas restantes; modal e tela de confirmação compartilhados em `client/src/components/enrollment-dialog.tsx` (reusados por `/capacitacao` e `/matricula`); card de `/capacitacao` passou a mostrar "preenchidas/total · N restantes" (`enrolledCount` derivado em `GET /api/courses` e novo `GET /api/courses/:id`); **trava de lotação no backend** (`POST /api/enrollments` → 409 quando lota, exceto admin); botão "Copiar link de matrícula" no dashboard. Validado ponta a ponta (matrícula de teste criada pelo link → contagem 13→14 → confirmação → removida → 13) ✓ *2026-07-03*
