# IDASAM — Instituto de Desenvolvimento Ambiental e Social da Amazônia

Sistema web completo do IDASAM, composto por um **site institucional público** e um **painel administrativo** para gestão de cursos, inscrições, certificados, conteúdo editorial, e-mail marketing, propostas e finanças.

---

## Sobre o IDASAM

O Instituto de Desenvolvimento Ambiental e Social da Amazônia (IDASAM) é uma organização dedicada à promoção do desenvolvimento sustentável na Amazônia, atuando nas frentes de bioeconomia, educação, tecnologia verde, pesquisa científica e capacitação profissional.

---

## Tecnologias Utilizadas

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Wouter (roteamento), TanStack Query, Framer Motion |
| **UI/Componentes** | shadcn/ui, Radix UI, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express, TypeScript, tsx |
| **Banco de Dados** | PostgreSQL (via Neon Database serverless), Drizzle ORM |
| **Autenticação** | Sessões customizadas com tokens Bearer (admin) |
| **E-mail** | Resend API |
| **Pagamentos** | Stripe |
| **Armazenamento de arquivos** | Supabase Storage |
| **Geração de PDF** | pdf-lib, jsPDF |
| **Formulários** | react-hook-form + Zod |

---

## Funcionalidades Principais

### Site Institucional (público)
- **Página Inicial** (`/`) — Apresentação do instituto, missão, áreas de atuação e destaques
- **Projetos** (`/projetos`) — Portfólio de projetos e iniciativas do IDASAM
- **Notícias** (`/noticias`) — Blog com artigos categorizados, comentários e reações
- **Capacitação** (`/capacitacao`) — Catálogo de cursos abertos, inscrições online e emissão de certificados
- **Meu Certificado** (`/meu-certificado`) — Consulta e download de certificados por código de autenticação
- **Transparência** (`/transparencia`) — Dados de transparência pública da organização
- **Doação** (`/doacao-usd`, `/doacao-eur`) — Fluxos de doação em USD e EUR via Stripe

### Painel Administrativo (protegido)
- **Dashboard** (`/dashboard`) — Visão geral com métricas e resumo de atividades
- **Capacitação** (`/dashboard/capacitacao`) — Gestão de cursos, inscrições e emissão de certificados em lote
- **Marketing** (`/dashboard/marketing`) — Gerenciamento de audiências, templates de e-mail e campanhas
- **Documentos** (`/dashboard/documentos`) — Criação e gestão de propostas, contratos e ofícios
- **Financeiro** (`/dashboard/financeiro`) — Controle financeiro básico
- **Projetos** (`/dashboard/projetos`) — Gestão de projetos institucionais
- **Usuários** (`/dashboard/usuarios`) — Gestão de usuários do sistema
- **Agenda** (`/agenda`) — Gerenciamento de agenda e eventos
- **Imprensa** (`/imprensa`) — Conteúdo para a imprensa

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [npm](https://www.npmjs.com/) v10 ou superior
- Banco de dados PostgreSQL (ex.: [Neon](https://neon.tech/))

---

## Instalação e Execução Local

### 1. Clone o repositório

```bash
git clone <url-do-repositório>
cd <nome-do-projeto>
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (veja a seção abaixo para detalhes):

```env
DATABASE_URL=postgresql://usuario:senha@host/banco
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=senha-segura
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
SUPABASE_URL=https://<projeto>.supabase.co
SUPABASE_ANON_KEY=...
```

### 4. Execute as migrações do banco de dados

```bash
npm run db:push
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`.

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | Sim |
| `ADMIN_EMAIL` | E-mail do administrador principal | Sim |
| `ADMIN_PASSWORD` | Senha do administrador principal | Sim |
| `EDITOR_EMAIL` | E-mail de um editor secundário | Não |
| `EDITOR_PASSWORD` | Senha do editor secundário | Não |
| `RESEND_API_KEY` | Chave da API Resend para envio de e-mails | Recomendado |
| `EMAIL_FROM` | Endereço de envio de e-mails (padrão: `IDASAM <onboarding@resend.dev>`) | Não |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe para pagamentos | Para doações |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe (frontend) | Para doações |
| `SUPABASE_URL` | URL do projeto Supabase | Não (integração parcial) |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | Não (integração parcial) |

---

## Estrutura de Pastas

```
.
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Contextos React (ex.: autenticação)
│   │   ├── hooks/           # Hooks customizados
│   │   ├── lib/             # Utilitários e configuração do cliente
│   │   └── App.tsx          # Entrada da aplicação e roteamento
│   └── index.html
├── server/
│   ├── index.ts             # Entrada do servidor Express
│   ├── routes.ts            # Rotas da API REST
│   ├── storage.ts           # Camada de acesso a dados
│   └── vite.ts              # Integração Vite (dev)
├── shared/
│   └── schema.ts            # Modelos de dados compartilhados (Drizzle + Zod)
├── uploads/                 # Arquivos enviados pelo usuário
├── drizzle.config.ts        # Configuração do Drizzle ORM
├── vite.config.ts           # Configuração do Vite
├── tailwind.config.ts       # Configuração do Tailwind CSS
└── package.json
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (backend + frontend) |
| `npm run build` | Gera o build de produção |
| `npm start` | Inicia o servidor em modo produção (após build) |
| `npm run check` | Verifica tipagem TypeScript |
| `npm run db:push` | Aplica o schema ao banco de dados via Drizzle |

---

## Integrações Externas

- **Stripe** — Processamento de doações em dólar (USD) e euro (EUR)
- **Resend** — Envio transacional e de campanhas de e-mail
- **Supabase** — Integração parcial para armazenamento de arquivos e consultas financeiras
- **Neon Database** — Banco de dados PostgreSQL serverless

---

## Acesso ao Painel Administrativo

O painel administrativo está disponível em `/admin`. As credenciais são configuradas via variáveis de ambiente (`ADMIN_EMAIL` e `ADMIN_PASSWORD`). Após o login, o sistema gera um token de sessão válido por 8 horas.

---

## Arquitetura

### Visão Geral

```
Monorepo full-stack (Express + React no mesmo repositório)
        │
        ├── server/          Backend Express (API REST)
        │     ├── index.ts   Entry point — Express + sessão + Vite middleware
        │     ├── routes.ts  Todas as rotas /api
        │     ├── db.ts      Conexão Drizzle + Neon serverless
        │     ├── storage.ts Camada de acesso a dados e uploads
        │     └── vite.ts    Serve o frontend em dev (Vite middleware)
        │
        ├── client/src/      Frontend React
        │     ├── pages/     Páginas públicas e do dashboard
        │     ├── components/ Componentes reutilizáveis
        │     ├── contexts/  Contextos React (autenticação)
        │     ├── hooks/     Hooks customizados
        │     └── App.tsx    Entrada + roteamento (Wouter)
        │
        └── shared/
              └── schema.ts  Schema Drizzle — fonte única de verdade para tipos e validações
```

### Fluxo de Dados

```
Browser (React + Wouter)
    └── TanStack Query → fetch /api/*
          └── Express routes.ts
                └── Drizzle ORM (storage.ts)
                      └── PostgreSQL (Neon serverless)
```

### Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `courses` | Cursos (título, instrutor, carga horária, datas, vagas, status) |
| `enrollments` | Matrículas de usuários em cursos |
| `certificates` | Certificados gerados por conclusão de curso |
| `articles` | Artigos/notícias do blog institucional |
| `email_campaigns` | Campanhas de e-mail marketing |
| `proposals` | Documentos (contratos, orçamentos, ofícios, relatórios, projetos) com PDF original e assinado |
| `signatarios` | Signatários internos cadastrados (nome, cargo, email) |
| `assinatura_links` | Tokens de assinatura externa (link público, 7 dias de validade) |
| `assinatura_logs` | Trilha de auditoria de assinaturas (nome, CPF, IP, user-agent, hash SHA-256) |

### Decisões Arquiteturais

| Decisão | Justificativa |
|---------|--------------|
| Monorepo full-stack | Frontend e backend no mesmo repo, deploy simplificado |
| Drizzle + Neon | ORM type-safe com PostgreSQL serverless — sem servidor para gerenciar |
| `shared/schema.ts` | Tipos compartilhados entre frontend e backend sem duplicação |
| Wouter (não React Router) | Roteamento leve no frontend |
| cross-env + --env-file | Compatibilidade Windows para variáveis de ambiente |
| Token Bearer (admin) | Sessão admin leve sem overhead de Passport completo |

---

## Status Atual

### Concluído
- [x] Setup inicial Express + React + Vite + TypeScript
- [x] Conexão com banco Neon via Drizzle ORM
- [x] Schema completo: users, courses, enrollments, certificates, articles, email_campaigns, proposals
- [x] Autenticação admin com token Bearer + sessão 8h
- [x] Configuração para rodar localmente no Windows (cross-env + --env-file)
- [x] Site institucional público (Home, Projetos, Notícias, Capacitação, Transparência, Doação)
- [x] Painel administrativo (Dashboard, Capacitação, Marketing, Documentos, Financeiro, Projetos, Usuários)
- [x] Integração Stripe (doações USD/EUR)
- [x] Integração Resend (e-mail transacional e campanhas)
- [x] Geração de certificados em PDF (pdf-lib + jsPDF)
- [x] Configurar ADMIN_EMAIL e ADMIN_PASSWORD — login admin habilitado ✓ *2026-04-06*
- [x] Salvar PDF junto com documentos emitidos (base64 no banco) ✓ *2026-04-07*
- [x] Preview de PDF no modal com react-pdf ✓ *2026-04-07*
- [x] Download, envio por email e upload de PDF assinado ✓ *2026-04-07*
- [x] Timeline de ciclo de vida: Emitido → Assinado → Enviado ✓ *2026-04-07*
- [x] Sistema de assinatura digital interna (IDASAM) com pdf-lib + signatários cadastrados ✓ *2026-04-07*
- [x] Assinatura externa via link público (/assinar/:token) com canvas, CPF, IP e evidências ✓ *2026-04-07*
- [x] Página de autenticação dedicada no PDF com QR Code + hash SHA-256 + link de validação ✓ *2026-04-07*
- [x] Página pública de validação de documentos (/validar/:hash) ✓ *2026-04-07*
- [x] Referência à Lei 14.063/2020 e Regulamento eIDAS ✓ *2026-04-07*

### Pendente
- [ ] Configurar STRIPE_SECRET_KEY e VITE_STRIPE_PUBLISHABLE_KEY para pagamentos
- [ ] Configurar RESEND_API_KEY para envio de e-mails
- [ ] Configurar SUPABASE_URL e SUPABASE_ANON_KEY para storage de arquivos
