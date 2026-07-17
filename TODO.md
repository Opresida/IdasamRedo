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

- [x] **Relatórios exclusivos por programa (PROINDI 4.0 / PTI)** — 2 botões novos na aba Analytics, abaixo de cada card do "Resumo por programa": "Baixar relatório PROINDI 4.0" e "Baixar relatório PTI", mesmo timbrado do geral mas com os dados **isolados** do programa. `getCapacitacaoAnalytics(program?)` reescala TODAS as métricas ao programa juntando inscrições/certificados por `courseId` (as tabelas não têm coluna de programa); rota aceita `?program=`; o relatório de um programa omite o bloco "Resumo por programa" e a coluna "Programa". Estado `baixandoRel` por-botão. **Verificado E2E no backend:** PROINDI + PTI reconciliam com o geral (6+3=9 cursos, 219+99=318 matrículas, 219+68=287 certificados, empresa 0+2=2), ranking isolado (6 proindi / 3 pti), `alunosFormados` distinto por CPF não soma (141 e 67, ambos ≤ 201), `?program=` inválido cai no geral. *Render visual dos 2 PDFs a conferir no navegador (mesmo motor de timbrado já validado no relatório geral).* *2026-07-16*
- [x] **Programa do curso (PROINDI 4.0 × PTI): filtro + relatório** — nova coluna `courses.program` (`'proindi' | 'pti'`, default `'pti'`) com constantes/labels em `shared/schema.ts`. Classificados os 9 cursos: **6 PROINDI 4.0** (IA's, Processos avaliativos, Transformação Digital, Inovação Tecnológica, Logística, Lean Manufacturing) e **3 PTI** (Fundamentos & Gestão, Maturidade 4.0, Sustentabilidade e ESG). No painel: seletor de Programa no form, selo no card e **filtro com contagem** (Todos 9 / PROINDI 4.0 6 / PTI 3), combinável com o de status. No Analytics: programa no ranking + bloco **"Resumo por programa"**, e no **relatório PDF** o bloco de totais por programa + coluna "Programa" no ranking. Backfill aplicado direto no Neon (mesmo banco de prod → já valendo lá). Verificado: totais batem (6 PROINDI = 219 matrículas + 3 PTI = 99 → 318 = total geral), filtro 6/3/9 e PDF conferido ✓ *2026-07-16*
- [x] **Ficha por `enrollmentId` — nenhum aluno fica fora do relatório** — a ficha era buscada por CPF/e-mail, mas muita inscrição tem `cpf: ''` e `email: 'N/A'`: `normalizeIdentifier('N/A')` vira `''` e `isName('N/A')` dá `true`, então a busca procurava um aluno *chamado* "N/A" → **404**. No curso de IA isso deixava **24 dos 56 alunos** fora do ZIP (e o dedupe ainda colapsava todos eles numa única chave `'n/a'` → sairia **zero** ficha pra eles). Agora `GET /api/capacitacao/aluno?enrollmentId=…` + `storage.getAlunoFichaByEnrollment`: com identificador utilizável (CPF 11 dígitos ou e-mail com "@") devolve a ficha consolidada da pessoa; sem ele, monta a ficha daquela inscrição. Dedupe só para quem tem identificador real. Vale também para o botão de ficha individual. Verificado: os 24 alunos "N/A" saíam 404 e agora dão 200; ZIP de curso de teste com aluno normal + "N/A" + vazio → **3/3 PDFs** ✓ *2026-07-16*
- [x] **Fichas de todos os alunos em ZIP + responsividade do painel** — (1) botão **"Fichas (ZIP)"** na barra de ações da lista de alunos (ao lado de "Exportar CSV") gera a ficha de cada aluno e baixa num ZIP, com progresso `x/N`, dedupe por pessoa, aluno sem CPF/e-mail pulado e falha individual sem derrubar o lote; reusa `generateLetterheadPdfBlob` (extraído do motor de PDF, sem mudar o botão individual) + JSZip/saveAs já instalados. (2) **Responsividade**: o bloqueio era o shell `admin-layout.tsx` (sidebar `w-64` fixa + conteúdo sem `min-w-0` → página com 1260px num celular de 375px) — agora sidebar vira **gaveta com hambúrguer** abaixo de `lg`, conteúdo `min-w-0`, paddings responsivos; em `capacitacao.tsx`: abas roláveis, cabeçalho do card empilha, tabela com `min-w-[900px]` que **rola** em vez de espremer. Verificado E2E: ZIP com 2 PDFs válidos no timbrado (curso descartável, apagado depois), ficha individual sem regressão, e 375/768/1440 sem rolagem horizontal com desktop intacto (sidebar 256px, 0 erros no console) ✓ *2026-07-16*
- [x] **Lista de Chamada → "Diário de Classe" horizontal (paisagem) igual ao modelo** — `printListaChamada` (`client/src/lib/lista-chamada.ts`) reescrito de retrato para **A4 paisagem** no formato "Diário de Classe — Controle de Frequência": logo IDASAM + cabeçalho institucional (com parceiro), faixa de infos, tabela com **uma coluna por dia de aula do período** (dd/mm + dia-da-semana) + TOTAL FALTAS, legenda P/F, assinaturas (Instrutor + Coordenação) e o **rodapé oficial do papel timbrado** (CNPJ/endereço) com "Página X de Y". Parceiro puxado da empresa predominante dos alunos (ignora "IDASAM"); modalidade extraída do `location`; dias gerados de start→end. Verificado gerando o PDF real do curso Maturidade 4.0 (31 alunos, 2 páginas) e comparando com o modelo — layout idêntico ✓ *2026-07-11*
- [x] **Remarketing: reenviar campanha para quem não abriu (individual + todos)** — no modal de detalhes da campanha, lista "Não abriram" ganhou botão **"Reenviar"** por pessoa e **"Enviar para todos que não abriram (N)"** (com confirmação inline). Endpoint `POST /api/marketing/campaigns/:id/resend { leadIds }` reusa a infra de envio + pixel com o **mesmo campaignId** (tracking idempotente → quem abrir migra de "não abriu"→"abriu" na própria campanha, sem dupla contagem nem nova linha; `sentCount` inalterado). Só campanhas normais (automação não tem roster). `/details` passou a devolver o `id` de cada lead. Sem migração. Verificado E2E com **audiência descartável** (sent:1/total:1, atribuição via pixel confirmada, edge cases 400, limpo depois — sem spammar leads reais) + UI Playwright (39 botões individuais + "enviar para todos (39)" + passo de confirmação cancelado com segurança; automação sem botões; 0 erros no console) ✓ *2026-07-10*
- [x] **Marketing → Analytics: botão "olho" com detalhes da campanha** — ícone de olho por campanha (ao lado da coluna Taxa) abre modal com **prévia da mensagem enviada** (iframe, re-renderizada do template) + lista de **quem abriu** (com data/hora) × **quem não abriu**, e botão "Copiar e-mails" por lista. Novo endpoint `GET /api/marketing/campaigns/:id/details` (`requireAdmin`) + `storage.getCampaignOpenEvents` / `getEnrollmentsByIds` (cruzando `audience_leads` × `campaign_open_events`; campanhas de automação resolvem e-mail pela matrícula e avisam que o roster completo não é rastreado). Sem migração. Verificado E2E (curl nas 7 campanhas + navegador: normal 26/39 e automação 4/9, prévia renderiza, 0 erros no console) ✓ *2026-07-10*
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
