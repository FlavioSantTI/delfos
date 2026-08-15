-- Aplicar no SQL Editor do Supabase (o app não usa CLI de migrations).
-- Idempotente: ENABLE RLS, policies mínimas, view com security_invoker.

ALTER TABLE public.diagnostico_ia
  ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ;
ALTER TABLE public.diagnostico_ia
  ADD COLUMN IF NOT EXISTS lgpd_term_version TEXT;

ALTER TABLE public.diagnostico_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diagnostico_ia_anon_insert ON public.diagnostico_ia;
CREATE POLICY diagnostico_ia_anon_insert
  ON public.diagnostico_ia
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS diagnostico_ia_authenticated_select ON public.diagnostico_ia;
CREATE POLICY diagnostico_ia_authenticated_select
  ON public.diagnostico_ia
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS diagnostico_ia_authenticated_delete ON public.diagnostico_ia;
CREATE POLICY diagnostico_ia_authenticated_delete
  ON public.diagnostico_ia
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir Inserção Pública" ON public.diagnostico_ia;
DROP POLICY IF EXISTS "Permitir Leitura Pública" ON public.diagnostico_ia;
DROP POLICY IF EXISTS "Permitir Exclusão Pública" ON public.diagnostico_ia;

REVOKE ALL ON public.diagnostico_ia FROM PUBLIC;
GRANT INSERT ON public.diagnostico_ia TO anon;
GRANT SELECT, DELETE ON public.diagnostico_ia TO authenticated;

CREATE TABLE IF NOT EXISTS public.relatorio_diagnostico_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    setor VARCHAR(255),
    total_empresas INTEGER,
    media_maturidade INTEGER,
    estagio_predominante VARCHAR(255),
    ferramenta_mais_usada VARCHAR(255),
    obstaculo_principal VARCHAR(255),
    observacoes TEXT
);

ALTER TABLE public.relatorio_diagnostico_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS relatorio_diagnostico_ia_authenticated_select ON public.relatorio_diagnostico_ia;
CREATE POLICY relatorio_diagnostico_ia_authenticated_select
  ON public.relatorio_diagnostico_ia
  FOR SELECT
  TO authenticated
  USING (true);

REVOKE ALL ON public.relatorio_diagnostico_ia FROM PUBLIC, anon;
GRANT SELECT ON public.relatorio_diagnostico_ia TO authenticated;

DROP VIEW IF EXISTS public.vw_relatorio_diagnostico_ia;
CREATE VIEW public.vw_relatorio_diagnostico_ia
WITH (security_invoker = true) AS
SELECT
    COALESCE(NULLIF(TRIM(setor), ''), 'Serviços Gerais / Outros') AS setor,
    COUNT(*)::INTEGER AS total_empresas,
    ROUND(AVG(
        CASE
            WHEN classificacao_nivel ~ '\d+%' THEN (substring(classificacao_nivel from '(\d+)%'))::INTEGER
            WHEN classificacao_nivel ~ '^\d+$' THEN classificacao_nivel::INTEGER
            ELSE 25
        END
    ))::INTEGER AS media_maturidade,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(estagio_ia), ''), 'Explorador')) AS estagio_predominante,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(ferramentas), ''), 'ChatGPT / LLMs')) AS ferramenta_mais_usada,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(obstaculo), ''), 'Falta de Tempo')) AS obstaculo_principal,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(objetivo), ''), 'Aumentar Produtividade')) AS observacoes
FROM public.diagnostico_ia
GROUP BY COALESCE(NULLIF(TRIM(setor), ''), 'Serviços Gerais / Outros');

REVOKE ALL ON public.vw_relatorio_diagnostico_ia FROM PUBLIC, anon;
GRANT SELECT ON public.vw_relatorio_diagnostico_ia TO authenticated;
