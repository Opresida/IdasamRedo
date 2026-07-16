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
| E-mail | SMTP agnóstico (nodemailer) ou Resend | — |
| Pagamentos | Stripe | — |
| Storage | Neon PostgreSQL (bytea/base64) | — |
| PDF | pdf-lib + jsPDF + html2canvas | — |
| Preview PDF | react-pdf | — |
| Parsing de PDF (server) | pdfjs-dist (legacy build) | 5.x |
| QR Code | qrcode (npm) | — |
| IA / LLM | Anthropic Claude Sonnet 4.6 (`@anthropic-ai/sdk`) | 0.90+ |

---

## Lógica de Negócio

### Organização
- IDASAM = Instituto de Desenvolvimento Ambiental e Social da Amazônia
- Áreas: bioeconomia, educação, tecnologia verde, pesquisa científica, capacitação profissional

### Autenticação
- Admin: token Bearer gerado no login (`/api/auth/login`), válido por 8h, armazenado em `localStorage`
- Variáveis obrigatórias: `ADMIN_EMAIL` + `ADMIN_PASSWORD` no `.env`
- Sem essas variáveis, login admin fica **desabilitado**

### Envio de E-mail (agnóstico de provedor)
- Função única `sendEmail(to, subject, htmlBody, attachments?)` em `server/routes.ts` — todos os envios passam por ela (matrícula, campanhas, LGPD, notificações, propostas com PDF anexo)
- **Prioridade SMTP:** se `SMTP_HOST` estiver definido no `.env`, envia por SMTP (nodemailer) — funciona com qualquer provedor (Brevo, Mailjet, SMTP2GO, etc.). Vars: `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- **Fallback Resend:** sem `SMTP_HOST`, usa `RESEND_API_KEY` (comportamento anterior preservado)
- `EMAIL_FROM` deve ser um **remetente verificado** no provedor escolhido (senão o envio é rejeitado — não é paywall, é anti-spam). Trocar de provedor = editar `.env`, sem mexer no código
- `EMAIL_ENABLED = !!(SMTP_HOST || RESEND_API_KEY)` gate os endpoints que exigem e-mail configurado
- **Template de "Matrícula em Curso" direcionado por curso:** templates (Markdown e HTML) têm `courseId` opcional. Na matrícula, a automação dispara o template **específico do curso** (`courseId === course.id`); se não houver, usa um **coringa** (`courseId` nulo = todos os cursos). No painel de Marketing, o seletor de curso aparece quando o gatilho é "Matrícula em Curso"
- **Rastreio de abertura (analytics de campanha):** cada campanha injeta um pixel invisível `<img src="{base}/api/marketing/track/open/:campaignId/:leadId">`. A `{base}` vem de `APP_URL` → domínio do Replit → host da requisição. **Só rastreia se a base for pública** — campanhas disparadas de `localhost` não registram abertura (o cliente de e-mail não alcança `localhost`). Em produção defina `APP_URL=https://<domínio>` nos Secrets. Limite inerente: clientes que bloqueiam imagens não contam abertura (toda ferramenta de e-mail subestima)
- **Detalhes por campanha (botão "olho" no Analytics):** cada linha da tabela de campanhas tem um ícone de olho que abre um modal com **prévia da mensagem** + **quem abriu × quem não abriu**. Endpoint `GET /api/marketing/campaigns/:id/details` (`requireAdmin`): re-renderiza a prévia do template (`emailTemplates.body` via `markdownToHtml`, ou `customHtmlTemplates.htmlContent`) — o envio **não** guarda o HTML final; monta `opened`/`notOpened` cruzando `getAudienceLeads(audienceId)` (roster) com `getCampaignOpenEvents(id)` (per-recipient via tabela `campaign_open_events`). Campanhas **de automação** (`audienceId` nulo) não têm roster: mostram só quem abriu (e-mail resolvido da matrícula via `getEnrollmentsByIds`, pois o `leadId` do pixel = id da matrícula) e `rosterAvailable:false`. Modal em `AnalyticsTab` (`CampaignDetailsModal`) com iframe de prévia + duas listas roláveis + "Copiar e-mails" por lista
- **Remarketing (reenviar p/ quem não abriu):** na lista "Não abriram" do modal, cada linha tem **"Reenviar"** (individual) e o cabeçalho tem **"Enviar para todos que não abriram (N)"** (com passo de confirmação inline). Endpoint `POST /api/marketing/campaigns/:id/resend { leadIds }` (`requireAdmin`) reusa a infra de envio (`markdownToHtml`/`renderTemplate`/`sendEmail` + pixel de abertura) e — crucialmente — **reenvia com o MESMO `campaignId`**: como o tracking é idempotente por `(campaignId, leadId)` (`unique_open_per_lead`), quem abrir o reenvio **migra de "não abriu" → "abriu" na própria campanha**, sem dupla contagem e sem criar linha nova no Analytics. `sentCount` não é alterado (mantém = disparo original; a `openRate` sobe conforme o remarketing converte). Só para campanhas normais (automação não tem roster → sem botões). O payload de `/details` passou a incluir o `id` de cada lead pra viabilizar o reenvio por pessoa
- **Analytics também rastreia AUTOMAÇÕES:** `emailCampaigns.audienceId` é nullable — uma campanha com `audienceId` nulo é uma **campanha de automação** (agregada por template via `storage.recordAutomationSend`). Cada disparo de automação (ex.: matrícula em curso) incrementa `sentCount` e injeta o mesmo pixel (usando o id da matrícula como `leadId`). O endpoint do pixel rastreia automações sem checar audiência. No painel, aparecem com o rótulo "⚡ Automação"
- **Adicionar leads em massa:** `POST /api/marketing/audiences/:id/leads/bulk` (`{ leads: [{name,email}] }`) adiciona vários de uma vez pulando duplicados por e-mail; o botão "Adicionar todos" no painel de Audiências usa isso sobre os resultados filtrados (por nome/e-mail ou por curso)

### Cursos e Matrículas
- Cursos têm status: `open` | `closed` | `coming_soon` | `completed`
- Cada curso pode ter código de autenticação (`authCode`) para validação de certificados
- Inscrições em `/capacitacao` — públicas, sem login
- **Link de matrícula por curso** — cada curso tem uma página pública dedicada `/matricula/:courseId` que usa o `id` (UUID) do próprio curso, **sem slug nem coluna nova**. O dashboard (`/dashboard/capacitacao`) tem botão "Copiar link de matrícula" por curso para enviar aos interessados. A página mostra as vagas restantes e abre o **mesmo** modal + tela de confirmação de `/capacitacao` — ambos usam o componente compartilhado `client/src/components/enrollment-dialog.tsx`
- **Contagem de vagas (preenchidas × disponíveis)** — `enrolledCount` é **derivado em tempo real, não é coluna**: `storage.getCourses()` e `storage.getCourseWithCount(id)` contam `enrollments` por curso (`count(*)::int`). Exposto no público via `GET /api/courses` (lista, um count agrupado) e `GET /api/courses/:id` (curso único). O card de `/capacitacao` e a página de matrícula mostram "preenchidas/total · N restantes"; quando `vacancies` é nulo (= ilimitado), mostram "N inscritos". Tipo compartilhado: `CourseWithEnrollment = Course & { enrolledCount: number }`
- **Trava de lotação** — `POST /api/enrollments` retorna **409 "Vagas esgotadas para este curso"** quando os inscritos atingem `vacancies`, exceto para admin (Bearer token válido). Curso sem `vacancies` nunca trava. Enforcement no backend (não só na tela) — funciona inclusive pelo link direto
- Certificados gerados em lote pelo admin ou consultados publicamente via `authCode`
- **Campo "Empresa" na inscrição:** `enrollments.company` (nullable) — capta se o inscrito vem de uma empresa (filtro/analytics + porta de entrada PD&i). Presente em todos os cadastros: modal público (`enrollment-dialog.tsx`), form admin (`EnrollmentFormDialog`), import/export CSV (coluna `empresa`) e coluna na lista de alunos. `insertEnrollmentSchema` (createInsertSchema sem extend) já inclui `company` automaticamente
- **Validação do modal público de inscrição** (`enrollment-dialog.tsx`, usado por `/capacitacao` e `/matricula`): **todos os campos são obrigatórios** (Nome, CPF, Telefone, E-mail — zod local com `.min`/`.email`, `*` nos labels). A Empresa virou **condicional**: um RadioGroup **"Vem de empresa? Não / Sim"** (default **Não**, campo fechado); só ao marcar **Sim** o input *Empresa* aparece e fica **obrigatório** (`.refine` no zod, `path: ['company']`); voltar pra Não limpa o valor e o erro. O `hasCompany` é só de UI — o submit envia `company: ''` quando "Não" e não manda `hasCompany`. **Required é client-side apenas** — o backend (`insertEnrollmentSchema`) segue permissivo, então o cadastro do admin e o `/api/enrollments/bulk` não são afetados
- **Sub-aba Analytics da Capacitação:** `GET /api/capacitacao/analytics` (`requireAdmin`) → `storage.getCapacitacaoAnalytics()`. Métricas: certificados emitidos, **alunos formados = pessoas distintas por CPF** (fallback e-mail/nome) entre os certificados, cursos concluídos, total de matrículas, matrículas com × sem empresa, ranking de cursos por matrícula, ranking de empresas de origem. Componente `CapacitacaoAnalyticsTab` (4ª aba do dashboard, espelha o visual do Analytics de Marketing)
- **Lista de chamada = "Diário de Classe — Controle de Frequência" (PDF paisagem):** botão no dashboard (`CourseEnrollments`) → `printListaChamada` em `client/src/lib/lista-chamada.ts`. É um **PDF vetorial real via jsPDF** (não HTML/iframe — o `window.print` de iframe não funciona no Chrome mobile), **baixado direto** (`Diário de Classe - {título}.pdf`), em **A4 paisagem**. Layout espelha o modelo oficial: logo IDASAM no topo + cabeçalho institucional (com **parceiro** do curso), faixa de infos (Período/Horário/Carga horária/Modalidade/Instrutor + Endereço/E-mail), tabela `Nº | NOME | CPF | {uma coluna por dia de aula do período: dd/mm + dia-da-semana} | TOTAL FALTAS`, legenda P/F, assinaturas (Instrutor + Coordenação) e o **rodapé oficial do papel timbrado** (marca + CNPJ 02.906.177/0001-87 + endereço) em todas as páginas com "Página X de Y". **Colunas de dia** = geradas de `startDate`→`endDate` (1 por dia, inclusive fim de semana). **Modalidade** extraída de `course.location` (regex `\(…\)`). **Parceiro** = empresa predominante no campo `company` das inscrições (ignora "IDASAM" p/ não virar "IDASAM e IDASAM"); sem empresa externa → só "IDASAM". Textos institucionais fixos: e-mail `institucional-am@idasam.org`, `Parceiro Institucional: ITEAM`, tagline "Inovação. Sustentabilidade. Futuro.". Alunos ordenados A-Z; CPF formatado. Logo SVG inline em `client/src/lib/idasam-logo-chamada-svg.ts` (módulo TS, **não** usar import `?raw` — trava o boot), rasterizado p/ PNG antes de entrar no PDF
- **Selo "Certificados enviados" × botão "Disparar Certificados"** (dashboard): o selo verde aparece **sempre que todos os inscritos têm certificado** (`certifiedCount >= enrolledCount`), **mesmo que o curso não tenha template salvo** (certificados enviados por upload individual). O botão de disparo em lote só aparece quando há template (`certTemplate` + `certBlockConfig`) **e** ainda falta alguém receber. `certifiedCount` é **derivado** (não é coluna): conta certificados com `fileData` por curso em `getCourses()`/`getCourseWithCount()`, mesma regra do badge "Enviado" da lista de alunos. Mutações de aluno/certificado invalidam `['/api/courses']` para manter o contador fresco
- **Ficha do aluno é buscada pelo `enrollmentId`** (`GET /api/capacitacao/aluno?enrollmentId=…` → `storage.getAlunoFichaByEnrollment`), **não** pelo CPF/e-mail: muita inscrição tem `cpf: ''` e `email: 'N/A'`, e por identifier isso quebrava feio — `normalizeIdentifier('N/A')` vira `''` e `isName('N/A')` dá `true`, então a busca procurava um aluno *chamado* "N/A" e devolvia **404** (no curso de IA eram **24 dos 56 alunos**). `getAlunoFichaByEnrollment` resolve a inscrição pelo id e: se houver **identificador utilizável** (`identificadorUtil`: CPF com 11 dígitos **ou** e-mail com "@"), delega pro `getAlunoFicha` (ficha consolidada da pessoa, todos os cursos); senão monta a ficha só daquela inscrição — assim **ninguém fica fora do relatório**. O `?identifier=` continua aceito por compatibilidade
- **Fichas de todos os alunos em ZIP:** botão **"Fichas (ZIP)"** na barra de ações da lista de alunos (ao lado de "Exportar CSV", em `CourseEnrollments`) → gera a ficha de **cada aluno** do curso e baixa tudo num ZIP (`Fichas - {curso}.zip`), via `JSZip` + `saveAs` (mesmo padrão da geração em lote de certificados). Usa `gerarFichaAlunoBlob` (novo em `relatorios-capacitacao.ts`) sobre `generateLetterheadPdfBlob` (novo em `letterhead-pdf.ts` — o mesmo motor do PDF individual, só que devolvendo o Blob em vez de baixar). **O laço é SEQUENCIAL de propósito**: o motor monta um container offscreen no `document.body` e alterna a classe global `sd-exporting` — `Promise.all` daria corrida. Cada ficha é rasterizada via html2canvas (~2-4s), então ~30 alunos ≈ 1-2 min → progresso `x/N` no próprio botão. **Todo aluno entra** (busca por `enrollmentId` — inclusive sem CPF/e-mail). O **dedupe só vale para quem tem CPF/e-mail utilizável**, porque aí a ficha é da pessoa e sairia idêntica; quem não tem identificador ganha sempre a própria ficha (dedupar por `'N/A'`/vazio colapsaria dezenas de alunos num só). Falha individual não derruba o lote; nomes repetidos ganham sufixo `_2`, `_3`
- **Responsividade do painel admin:** o bloqueio real **não** estava nas páginas e sim no shell `client/src/components/admin-layout.tsx` — a sidebar era `w-64` **fixa e sempre visível** e o conteúdo era `flex-1` **sem `min-w-0`**, então num celular de 375px a página inteira era desenhada com ~1260px e rolava na horizontal. Agora: sidebar `hidden lg:flex` + **gaveta (Sheet) com hambúrguer** abaixo de `lg` (o mesmo `sidebarContent` é reusado nos dois; navegar fecha a gaveta; `SheetTitle` com `sr-only` porque o Radix Dialog exige título), conteúdo com `min-w-0` e paddings `p-4 sm:p-6 lg:p-8`. **Isso vale para TODAS as páginas do dashboard.** Em `dashboard/capacitacao.tsx`: abas com `overflow-x-auto` + `shrink-0`, cabeçalho do card `flex-col sm:flex-row`, e a tabela de alunos com **`min-w-[900px]`** para o `overflow-x-auto` de fato **rolar** em vez de espremer as 7 colunas (+ `whitespace-nowrap` nas células)
- **Relatórios em PDF no papel timbrado oficial:** `client/src/lib/letterhead-pdf.ts` é o **motor reaproveitável de PDF timbrado** — cópias fiéis das funções de timbrado do Suite Documental (`createA4Page`/`autoPaginate`/`splitTableAcrossPages`/`sdSanitizeClone`/`buildWhiteLogoDataUrl`, importa `suite.css`), sem tocar no arquivo crítico `SuiteDocumental.tsx`. API: `generateLetterheadPdf(bodyHtml, docType, filename)` (container oculto → `autoPaginate` gera `.sd-page-a4` → html2canvas+jsPDF → baixa o blob). **Regra:** o `bodyHtml` usa **cores hex inline** (html2canvas 1.4.1 não lê `oklch`). Os relatórios da capacitação vivem em `client/src/lib/relatorios-capacitacao.ts`: (1) **"Baixar Relatório"** na sub-aba Analytics (`baixarRelatorioAnalytics(data)`, usa o `data` do `useQuery`) → resumo geral + ranking de cursos + empresas de origem. (2) **"Ficha do aluno"** (ícone `FileDown`) nas Ações de cada aluno em `CourseEnrollments` → `GET /api/capacitacao/aluno?identifier=<cpf|email|nome>` (`requireAdmin` → `storage.getAlunoFicha`) → `baixarFichaAluno(ficha)`. A ficha reconstrói a identidade do aluno pelas linhas de `enrollments` (casa por CPF/e-mail via `getEnrollmentByIdentifier`): identificação, **veio de empresa? / qual** (empresa do registro que a informa, senão do mais recente), nº de inscrições, concluídos (= certificados com `fileData`), certificados, **se consta na lista de Notificações** (`getCourseNotificationSubscriptions` casando e-mail normalizado) e tabela dos cursos com status. Só leitura/agregação — **sem migração**

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

### Importador de Proposta de Projeto via PDF (IA)
- Botão "Importar PDF" na aba "Projeto" da Suite Documental abre modal de upload
- Backend recebe PDF, extrai texto e imagens com `pdfjs-dist` (`server/services/pdfParser.ts`)
- Claude Sonnet 4.6 recebe o PDF nativo via content block `document` e retorna JSON estruturado (título, responsável, organização, valor, blocos tipo `texto`/`tabela`/`imagem`) no mesmo formato do `projData` manual — `server/services/anthropic.ts`
- Servidor substitui placeholders `IMG_0`, `IMG_1`, … pelos data URLs das imagens extraídas
- Frontend popula o formulário existente via `setProjData(...)` — admin revisa e gera PDF pelo fluxo manual normal
- **Regra de ouro:** o fluxo manual de digitação NÃO é alterado; a importação é aditiva
- Paginação de tabela: quando uma tabela não cabe em uma página, o paginador quebra linha por linha repetindo o cabeçalho na próxima página (`splitTableAcrossPages` em `SuiteDocumental.tsx`)
- **Tracking de custo local:** tabela `anthropic_usage` registra input/output/cache tokens + custo em USD (preços Sonnet 4.6: $3/M input, $15/M output, $3.75/M cache write, $0.30/M cache read) por operação
- Rota `GET /api/admin/anthropic-usage` retorna total gasto, gasto do mês, média $/doc de 10 páginas, restante (se `ANTHROPIC_BUDGET_USD` estiver setado) e projeção de docs restantes
- Modal do importador exibe barra de progresso do saldo com alertas ≥70% / ≥90% / 100%; botão de submit é desabilitado quando saldo ≤ $0
- Vars necessárias: `ANTHROPIC_API_KEY` (obrigatória pra funcionar) e `ANTHROPIC_BUDGET_USD` (opcional, só pra projeção)

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
