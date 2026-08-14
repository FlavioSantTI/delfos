-- Script SQL para criação da tabela no PostgreSQL (Database DB_Automacoes)
-- Executar no seu cliente SQL (pgAdmin, DBeaver, psql, etc.)

CREATE TABLE IF NOT EXISTS public.diagnostico_ia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    empresa TEXT NOT NULL,
    setor TEXT,
    porte TEXT,
    estagio_ia TEXT NOT NULL,
    ferramentas TEXT,
    areas_aplicacao TEXT,
    obstaculo TEXT,
    objetivo TEXT,
    processo_especifico TEXT,
    classificacao_nivel TEXT,
    status_processamento TEXT DEFAULT 'pending'
);

-- Comentários nas colunas para documentação
COMMENT ON TABLE diagnostico_ia IS 'Tabela de respostas do formulário de Diagnóstico de Maturidade em IA - Empretec';
COMMENT ON COLUMN diagnostico_ia.estagio_ia IS 'Estágio selecionado pelo usuário (ex: Estágio 0: Curioso, Estágio 1: Explorador, etc)';
COMMENT ON COLUMN diagnostico_ia.status_processamento IS 'Status para ser atualizado pelo n8n / agente de automação (ex: pending, processed, sent_whatsapp)';
