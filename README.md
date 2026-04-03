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
