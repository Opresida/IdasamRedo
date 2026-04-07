# TODO — IDASAM

Lista de tarefas pendentes, melhorias planejadas e bugs conhecidos.

---

## Em andamento

- [ ] Configurar variáveis de ambiente das integrações externas (Stripe, Resend, Supabase)

---

## Funcionalidades pendentes

### Alta prioridade
- [ ] Configurar `STRIPE_SECRET_KEY` e `VITE_STRIPE_PUBLISHABLE_KEY` para pagamentos
- [ ] Configurar `RESEND_API_KEY` para envio de e-mails

### Média prioridade
- [ ] Configurar `SUPABASE_URL` e `SUPABASE_ANON_KEY` para storage de arquivos
- [ ] Testar fluxo completo de matrícula → certificado
- [ ] Testar geração de PDF dos certificados

### Baixa prioridade
- [ ] Documentar todas as rotas da API em `server/routes.ts`
- [ ] Adicionar testes automatizados

---

## Bugs conhecidos

- Nenhum registrado ainda.

---

## Concluído

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
