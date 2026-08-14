# DelfosIA — Diagnóstico, predição e acompanhamento de maturidade
> **by Flávio Santiago ConsultorIA**

O **DelfosIA** é uma plataforma moderna e interativa de diagnóstico de maturidade empresarial em Inteligência Artificial. A ferramenta avalia o nível atual da organização (Iniciante, Exploratório, Estruturado ou Avançado) através de um fluxo estruturado em etapas, gerando recomendações práticas, direcionamento de investimentos e plano de ação imediato para automação e governança.

---

## 🚀 Principais Funcionalidades

- **Diagnóstico em 3 Etapas Estruturadas:**
  1. **Informações de Contato e Perfil:** Identificação da empresa, porte, setor e canal de comunicação direto (WhatsApp/E-mail).
  2. **Maturidade e Tecnologias:** Nível de adoção de IA, ferramentas utilizadas (ChatGPT, Copilot, APIs, Claude, etc.) e áreas estratégicas de aplicação.
  3. **Objetivos e Desafios:** Principais gargalos, processos prioritários para automação e objetivos de negócio.

- **Painel Administrativo & Relatórios:**
  - Visualização de diagnósticos recebidos em tempo real.
  - Métricas de maturidade por setor e distribuição de níveis.
  - Filtros dinâmicos e busca por empresa/responsável.
  - Exportação de dados e visualização detalhada de respostas.

- **Múltiplas Integrações de Persistência:**
  - **Supabase (PostgreSQL Cloud):** Gravação estruturada na tabela `diagnostico_ia`.
  - **PostgreSQL Direto / API REST:** Conexão com banco relacional e endpoints de sincronização.
  - **n8n / Webhooks:** Disparo automático de fluxos de automação, alertas e relatórios personalizados via WhatsApp/Email.

- **Exportação de Widget / HTML:**
  - Modal integrado para gerar o código HTML/iframe para incorporação em qualquer site externo, landing page ou portal WordPress.

---

## 🛠️ Stack Tecnológica

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Animações:** [Motion](https://motion.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend / Servidor:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx), [esbuild](https://esbuild.github.io/)
- **Banco de Dados & Integrações:** [@supabase/supabase-js](https://supabase.com/), `pg` (PostgreSQL Client)

---

## 📦 Estrutura do Projeto

```text
├── src/
│   ├── components/         # Componentes do Formulário, Admin e UI
│   │   ├── Header.tsx      # Cabeçalho da aplicação DelfosIA
│   │   ├── Hero.tsx        # Apresentação do diagnóstico
│   │   ├── Step1Contact.tsx# Etapa 1: Dados de contato e perfil
│   │   ├── Step2Diagnosis.tsx # Etapa 2: Diagnóstico de maturidade
│   │   ├── Step3Goals.tsx  # Etapa 3: Objetivos e gargalos
│   │   ├── SuccessCard.tsx # Tela de confirmação e protocolo
│   │   ├── ReportsView.tsx # Painel de relatórios administrativos
│   │   ├── IntegrationModal.tsx # Configuração e testes de integrações
│   │   └── HtmlExportModal.tsx  # Exportação de código embed
│   ├── lib/
│   │   └── supabase.ts     # Cliente e operações do Supabase
│   ├── types.ts            # Interfaces TypeScript do projeto
│   ├── App.tsx             # Componente raiz e controle de rotas/fluxos
│   └── main.tsx            # Ponto de entrada do React
├── server.ts               # Servidor Express com rotas de API e Vite
├── schema.sql              # Estrutura SQL da tabela no Supabase / Postgres
├── package.json
└── vite.config.ts
```

---

## ⚙️ Instalação e Execução Local

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm` ou `pnpm`

### 2. Clonar e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd delfos-ia
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anonima-supabase"
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:3000`.

### 5. Build de Produção
```bash
npm run build
npm start
```

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

Para criar a tabela no Supabase ou PostgreSQL, execute o script disponível em `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS diagnostico_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    empresa VARCHAR(255) NOT NULL,
    setor VARCHAR(100),
    porte VARCHAR(50),
    estagio_ia VARCHAR(100),
    ferramentas TEXT[],
    areas_aplicacao TEXT[],
    obstaculo TEXT,
    objetivo TEXT,
    processo_especifico TEXT,
    classificacao_nivel VARCHAR(50),
    status_processamento VARCHAR(50) DEFAULT 'pendente'
);
```

---

## 👤 Créditos & Autoria

Desenvolvido por **Flávio Santiago ConsultorIA**.
Todos os direitos reservados.
