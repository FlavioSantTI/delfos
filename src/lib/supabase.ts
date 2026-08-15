export interface DiagnosticoRecord {
  id: string;
  created_at: string;
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  setor?: string | null;
  porte?: string | null;
  estagio_ia: string;
  ferramentas?: string | null;
  areas_aplicacao?: string | null;
  obstaculo?: string | null;
  objetivo?: string | null;
  processo_especifico?: string | null;
  classificacao_nivel?: string | null;
  status_processamento?: string | null;
  lgpd_consent_at?: string | null;
  lgpd_term_version?: string | null;
}

export interface RelatorioDiagnosticoRecord {
  id?: string;
  created_at?: string;
  setor?: string;
  total_empresas?: number;
  media_maturidade?: number;
  estagio_predominante?: string;
  ferramenta_mais_usada?: string;
  obstaculo_principal?: string;
  observacoes?: string;
  [key: string]: any;
}
