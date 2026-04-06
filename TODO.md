# TODO — IDASAM

Lista de tarefas pendentes, melhorias planejadas e bugs conhecidos.

---

## Em andamento

- [ ] Configurar variáveis de ambiente para habilitar todas as integrações

---

## Funcionalidades pendentes

### Alta prioridade
- [ ] Configurar `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` para habilitar login admin
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
