import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FormData } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://rbcghgztrbggtonvorsr.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_VpSgH8HokATbjmALM54WWw_cgN7m4c8';

let clientInstance: SupabaseClient | null = null;
let clientUrl = '';
let clientKey = '';

export function getSupabaseClient(url?: string, key?: string): SupabaseClient {
  const env = (import.meta as any).env || {};
  const targetUrl = url || env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const targetKey = key || env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  if (!clientInstance || clientUrl !== targetUrl || clientKey !== targetKey) {
    clientUrl = targetUrl;
    clientKey = targetKey;
    clientInstance = createClient(targetUrl, targetKey);
  }

  return clientInstance;
}

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
}

export async function saveDiagnosticoToSupabase(
  formData: FormData,
  score: number,
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);

    const ferramentasStr = Array.isArray(formData.ferramentas) && formData.ferramentas.length > 0
      ? formData.ferramentas.join(', ')
      : null;

    const areasStr = Array.isArray(formData.areas) && formData.areas.length > 0
      ? formData.areas.join(', ')
      : null;

    const record = {
      nome: formData.nome,
      whatsapp: formData.whatsapp,
      email: formData.email,
      empresa: formData.empresa,
      setor: formData.setor || null,
      porte: formData.porte || null,
      estagio_ia: formData.estagio,
      ferramentas: ferramentasStr,
      areas_aplicacao: areasStr,
      obstaculo: formData.obstaculo || null,
      objetivo: formData.objetivo || null,
      processo_especifico: formData.processo?.trim() || null,
      classificacao_nivel: `Nível ${formData.estagioNivel ?? 0} (${score}%)`,
      status_processamento: 'pending'
    };

    const { data, error } = await supabase
      .from('diagnostico_ia')
      .insert([record])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] };
  } catch (err: any) {
    console.error('Failed to save to Supabase:', err);
    return { success: false, error: err.message || 'Erro desconhecido ao salvar no Supabase' };
  }
}

export async function fetchDiagnosticosFromSupabase(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; data: DiagnosticoRecord[]; error?: string }> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);

    const { data, error } = await supabase
      .from('diagnostico_ia')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Select Error:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: (data as DiagnosticoRecord[]) || [] };
  } catch (err: any) {
    console.error('Failed to fetch from Supabase:', err);
    return { success: false, data: [], error: err.message || 'Erro ao buscar dados do Supabase' };
  }
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

export async function fetchViewRelatorioFromSupabase(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; tableExists: boolean; data: RelatorioDiagnosticoRecord[]; error?: string }> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const { data, error } = await supabase
      .from('vw_relatorio_diagnostico_ia')
      .select('*');

    if (error) {
      return { success: false, tableExists: false, data: [], error: error.message };
    }

    return { success: true, tableExists: true, data: (data as RelatorioDiagnosticoRecord[]) || [] };
  } catch (err: any) {
    return { success: false, tableExists: false, data: [], error: err.message || 'Erro ao buscar vw_relatorio_diagnostico_ia' };
  }
}

export async function fetchTabelaRelatorioFromSupabase(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; tableExists: boolean; data: RelatorioDiagnosticoRecord[]; error?: string }> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const { data, error } = await supabase
      .from('relatorio_diagnostico_ia')
      .select('*');

    if (error) {
      return { success: false, tableExists: false, data: [], error: error.message };
    }

    return { success: true, tableExists: true, data: (data as RelatorioDiagnosticoRecord[]) || [] };
  } catch (err: any) {
    return { success: false, tableExists: false, data: [], error: err.message || 'Erro ao buscar relatorio_diagnostico_ia' };
  }
}

export async function fetchRelatorioFromSupabase(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; tableExists: boolean; data: RelatorioDiagnosticoRecord[]; error?: string }> {
  return fetchViewRelatorioFromSupabase(customUrl, customKey);
}

export async function deleteDiagnosticoFromSupabase(
  id: string,
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);

    const { error } = await supabase
      .from('diagnostico_ia')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao excluir do Supabase' };
  }
}
