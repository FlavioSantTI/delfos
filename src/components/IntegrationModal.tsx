import React, { useState } from 'react';
import { X, Database, Workflow, Key, Copy, Check, Shield, Server, Terminal } from 'lucide-react';
import { IntegrationConfig } from '../types';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IntegrationConfig;
  onSaveConfig: (newConfig: IntegrationConfig) => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  if (!isOpen) return null;

  const [formConfig, setFormConfig] = useState<IntegrationConfig>(config);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedN8n, setCopiedN8n] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql' | 'n8n'>('credentials');
  const [testDbStatus, setTestDbStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({ loading: false });

  const sqlSnippet = `-- Script SQL para criar a tabela e permissões no Supabase (SQL Editor)
CREATE TABLE IF NOT EXISTS public.diagnostico_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  empresa TEXT NOT NULL,
  setor TEXT NULL,
  porte TEXT NULL,
  estagio_ia TEXT NOT NULL,
  ferramentas TEXT NULL,
  areas_aplicacao TEXT NULL,
  obstaculo TEXT NULL,
  objetivo TEXT NULL,
  processo_especifico TEXT NULL,
  classificacao_nivel TEXT NULL,
  status_processamento TEXT NULL DEFAULT 'pending'::text,
  CONSTRAINT diagnostico_ia_pkey PRIMARY KEY (id)
);

-- IMPORTANTE: DESABILITAR RLS PARA PERMITIR GRAVAÇÃO PÚBLICA (ANON):
ALTER TABLE public.diagnostico_ia DISABLE ROW LEVEL SECURITY;

-- OU CASO PREFIRA MANTER RLS ATIVO, CRIE AS POLÍTICAS DE ACESSO:
-- CREATE POLICY "Permitir Inserção Pública" ON public.diagnostico_ia FOR INSERT TO anon, authenticated WITH CHECK (true);
-- CREATE POLICY "Permitir Leitura Pública" ON public.diagnostico_ia FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY "Permitir Exclusão Pública" ON public.diagnostico_ia FOR DELETE TO anon, authenticated USING (true);`;

  const n8nPayloadExample = `{
  "id": "a3b8c2d1-9e4f-4a01-9b1c-3d2e1f0a",
  "created_at": "2026-08-13T05:00:00.000Z",
  "nome": "Carlos Eduardo",
  "whatsapp": "(11) 99999-9999",
  "email": "carlos@empresa.com.br",
  "empresa": "Minha Empresa",
  "setor": "Serviços",
  "porte": "2 a 5 colaboradores",
  "estagio_ia": "Estágio 1 (Explorador)",
  "ferramentas": "ChatGPT, Claude, n8n",
  "areas_aplicacao": "Marketing, Vendas",
  "obstaculo": "Falta de conhecimento técnico",
  "objetivo": "Automatizar tarefas repetitivas",
  "processo_especifico": "Atendimento e envio de orçamentos via WhatsApp",
  "classificacao_nivel": "Nível 1 (25%)",
  "status_processamento": "pending"
}`;

  const handleTestPostgres = async () => {
    setTestDbStatus({ loading: true });
    try {
      const res = await fetch('/api/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: formConfig.supabaseUrl,
          supabaseKey: formConfig.supabaseAnonKey
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestDbStatus({ loading: false, success: true, message: data.message });
      } else {
        setTestDbStatus({ loading: false, success: false, message: data.error || 'Erro de conexão' });
      }
    } catch (err: any) {
      setTestDbStatus({ loading: false, success: false, message: err.message || 'Servidor indisponível' });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyN8n = () => {
    navigator.clipboard.writeText(n8nPayloadExample);
    setCopiedN8n(true);
    setTimeout(() => setCopiedN8n(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Integração Supabase & Webhook n8n</h3>
              <p className="text-xs text-slate-400">Configure suas credenciais do banco e automação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-2">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            Credenciais de Conexão
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Script SQL (PostgreSQL)
          </button>
          <button
            onClick={() => setActiveTab('n8n')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'n8n'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Workflow className="w-4 h-4" />
            Payload n8n
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: Credentials */}
          {activeTab === 'credentials' && (
            <form id="integration-form" onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* PostgreSQL Connection String */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    PostgreSQL Connection String (Auto-Hospedado)
                  </label>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    Backend Direct
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formConfig.postgresDbUrl || ''}
                    onChange={(e) => setFormConfig({ ...formConfig, postgresDbUrl: e.target.value })}
                    placeholder="postgresql://questionario:Favuca%401970@PostGres:5432/DB_Automacoes"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:border-indigo-600 outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestPostgres}
                    disabled={testDbStatus.loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition shrink-0 disabled:opacity-50"
                  >
                    {testDbStatus.loading ? 'Testando...' : 'Testar Conexão'}
                  </button>
                </div>

                {testDbStatus.message && (
                  <p className={`text-xs font-semibold mt-1 ${testDbStatus.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {testDbStatus.success ? '✓ ' : '✕ '} {testDbStatus.message}
                  </p>
                )}
              </div>

              {/* Supabase URL */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Supabase Project URL (Opcional)
                </label>
                <input
                  type="url"
                  value={formConfig.supabaseUrl}
                  onChange={(e) => setFormConfig({ ...formConfig, supabaseUrl: e.target.value })}
                  placeholder="https://seu-projeto.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* Supabase Anon Key */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Supabase Anon Key (Public Key)
                </label>
                <input
                  type="text"
                  value={formConfig.supabaseAnonKey}
                  onChange={(e) => setFormConfig({ ...formConfig, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* Table Name */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Nome da Tabela
                </label>
                <input
                  type="text"
                  value={formConfig.supabaseTable}
                  onChange={(e) => setFormConfig({ ...formConfig, supabaseTable: e.target.value })}
                  placeholder="diagnostico_ia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* n8n Webhook URL */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  URL do Webhook do n8n
                </label>
                <input
                  type="url"
                  value={formConfig.n8nWebhookUrl}
                  onChange={(e) => setFormConfig({ ...formConfig, n8nWebhookUrl: e.target.value })}
                  placeholder="https://n8n.suaempresa.com/webhook/diagnostico-ia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </form>
          )}

          {/* TAB 2: PostgreSQL / Supabase SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Copie e execute no SQL Editor do Supabase:</span>
                <button
                  onClick={handleCopySql}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                </button>
              </div>

              <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                <code>{sqlSnippet}</code>
              </pre>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Segurança RLS:</strong> A política aciona permissão para o papel <code className="bg-amber-100 px-1 rounded">anon</code> apenas para inserções (<code className="bg-amber-100 px-1 rounded">INSERT</code>), protegendo seus registros de leitura pública indevida.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: n8n Payload */}
          {activeTab === 'n8n' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Formato do JSON recebido pelo Webhook do n8n:</span>
                <button
                  onClick={handleCopyN8n}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                  {copiedN8n ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedN8n ? 'Copiado!' : 'Copiar JSON'}
                </button>
              </div>

              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                <code>{n8nPayloadExample}</code>
              </pre>

              <p className="text-xs text-slate-500">
                Você pode utilizar este payload de teste nos nós de <strong>Evolution API (WhatsApp)</strong>, <strong>Z-API</strong> ou <strong>SendGrid / Gmail</strong> do n8n para enviar mensagens automáticas.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300"
          >
            Cancelar
          </button>
          {activeTab === 'credentials' && (
            <button
              type="submit"
              form="integration-form"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              Salvar Configurações
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
