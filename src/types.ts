export interface FormData {
  // Etapa 1
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  setor: string;
  porte: string;

  // Etapa 2
  estagio: string;
  estagioNivel: number;
  ferramentas: string[];
  areas: string[];

  // Etapa 3
  obstaculo: string;
  objetivo: string;
  processo: string;
  lgpdConsent?: boolean;
}

export interface StageOption {
  id: string;
  nivel: number;
  titulo: string;
  subtitulo: string;
  descricao: string;
  icone: string;
  cor: string;
  badge: string;
}

export interface IntegrationConfig {
  postgresDbUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseTable: string;
  n8nWebhookUrl: string;
}

export interface SubmissionResult {
  id: string;
  score: number;
  data: FormData;
  timestamp: string;
  postgresSuccess: boolean;
  supabaseSuccess: boolean;
  n8nSuccess: boolean;
  mensagem: string;
}
