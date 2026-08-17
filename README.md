# DelfosIA 1.1 — Diagnóstico, predição e acompanhamento de maturidade
> **by Flávio Santiago ConsultorIA**

O **DelfosIA** é uma plataforma de diagnóstico de maturidade empresarial em Inteligência Artificial. Avalia o nível da organização (Iniciante, Exploratório, Estruturado ou Avançado) em um fluxo em etapas e gera recomendações práticas, direcionamento de investimentos e plano de ação.

**Versão:** 1.1  
**Repositório:** [github.com/FlavioSantTI/delfos](https://github.com/FlavioSantTI/delfos)

---

## Principais funcionalidades

- **Diagnóstico em 3 etapas**
  1. **Contato e perfil:** empresa, porte, setor e canal (WhatsApp/e-mail), com consentimento LGPD.
  2. **Maturidade e tecnologias:** estágio de IA, ferramentas e áreas de aplicação.
  3. **Objetivos e desafios:** gargalos, processos a automatizar e objetivos de negócio.

- **Painel administrativo**
  - Login com sessão no servidor (cookie httpOnly + CSRF). Sem senha padrão no código.
  - Relatórios e exclusões somente via API autenticada (`/api/reports*`).
  - Métricas de maturidade, filtros e exportação CSV.

- **Persistência**
  - Envio do diagnóstico pelo servidor (`POST /api/diagnostico`) para a tabela `diagnostico_ia` no Supabase.
  - RLS no Postgres: `anon` só INSERT; leitura/exclusão no painel pelo backend com `service_role`.

- **Widget HTML**
  - Modal para gerar código de incorporação (iframe) em site ou landing page, sem embutir chaves.

---

## Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide
- **Servidor:** Node.js, Express, tsx (dev), esbuild (build)
- **Dados:** Supabase (Postgres) e, opcionalmente, `pg`

---

## Estrutura do projeto

```text
├── src/
│   ├── components/          # Formulário, admin e UI
│   ├── lib/
│   │   ├── adminApi.ts      # Fetch same-origin com CSRF
│   │   └── supabase.ts      # Tipos dos registros
│   ├── App.tsx
│   └── main.tsx
├── adminSession.ts          # Cookie HMAC + CSRF + senha admin
├── rateLimit.ts             # Limite de requisições (arquivo local)
├── server.ts                # Express + Vite + APIs
├── schema.sql               # Bootstrap do banco (projeto novo)
├── migrations/
│   └── enable_rls.sql       # RLS + view (projeto já existente)
├── .env.example
└── package.json
```

---

## Instalação e execução local

### 1. Pré-requisitos

- Node.js 18 ou superior
- npm

### 2. Clonar e instalar

```bash
git clone https://github.com/FlavioSantTI/delfos.git
cd delfos
npm install
```

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` (o `.env` **não** entra no git):

```bash
cp .env.example .env
```

Preencha no Dashboard do Supabase e no `.env`:

| Variável | Onde obter | Uso |
|---|---|---|
| `SUPABASE_URL` | Project Settings → API | URL do projeto |
| `SUPABASE_ANON_KEY` | API Keys → **publishable** / `anon` (`sb_publishable_...`) | INSERT público via RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | API Keys → **secret** / `service_role` (`sb_secret_...`) | Só no servidor (relatórios) |
| `ADMIN_PASSWORD` | Você define (≥12 caracteres) | Login do painel |
| `SESSION_SECRET` | String aleatória (≥16; ex. `openssl rand -hex 32`) | Assina o cookie de sessão |

`HOST` padrão: `127.0.0.1`. `PORT` padrão: `3000`.

Nunca coloque `service_role` em `VITE_*` / `NEXT_PUBLIC_*`. Sem `SUPABASE_SERVICE_ROLE_KEY`, as APIs de relatório respondem **503**. Sem `ADMIN_PASSWORD` / `SESSION_SECRET`, o login admin não funciona.

Reinicie o Node depois de alterar o `.env` (`Ctrl+C` e `npm run dev` de novo).

### 4. Desenvolvimento

```bash
npm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000).

### 5. Produção

```bash
npm run build
npm start
```

---

## Banco de dados (Supabase)

**Projeto novo:** rode `schema.sql` no SQL Editor.

**Projeto que já tem dados:** rode **somente** `migrations/enable_rls.sql` (idempotente). Não rode `schema.sql` em produção com dados — ele é bootstrap.

O script de RLS:

- liga RLS em `diagnostico_ia` e `relatorio_diagnostico_ia`
- recria `vw_relatorio_diagnostico_ia` com `security_invoker = true`
- adiciona colunas LGPD se ainda não existirem

Se o `CREATE OR REPLACE VIEW` falhar ao renomear colunas, o script atual já faz `DROP VIEW` + `CREATE VIEW`.

---

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (`tsx server.ts`) |
| `npm run build` | Build Vite + bundle do servidor |
| `npm start` | Sobe `dist/server.cjs` |
| `npm run lint` | `tsc --noEmit` |

---

## Créditos

Desenvolvido por **Flávio Santiago ConsultorIA**.  
Todos os direitos reservados.
