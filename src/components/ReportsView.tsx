import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Search,
  RefreshCw,
  Download,
  Filter,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  Lock,
  Shield,
  Key,
  Database,
  Layers,
  Table,
  Code,
  Copy,
  Info,
  PieChart,
  BarChart3,
  Users,
  Check
} from 'lucide-react';
import {
  fetchDiagnosticosFromSupabase,
  deleteDiagnosticoFromSupabase,
  fetchViewRelatorioFromSupabase,
  fetchTabelaRelatorioFromSupabase,
  fetchRelatorioFromSupabase,
  DiagnosticoRecord,
  RelatorioDiagnosticoRecord
} from '../lib/supabase';

interface ReportsViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onClose, isModal = false }) => {
  // Tab Switcher inside Admin Area
  const [activeTab, setActiveTab] = useState<'diagnostico_ia' | 'vw_relatorio_diagnostico_ia' | 'relatorio_diagnostico_ia'>('diagnostico_ia');

  // Diagnostico IA records (Respostas dos Clientes)
  const [records, setRecords] = useState<DiagnosticoRecord[]>([]);

  // View: vw_relatorio_diagnostico_ia records (Inteligência Setorial)
  const [viewRecords, setViewRecords] = useState<RelatorioDiagnosticoRecord[]>([]);
  const [hasViewTable, setHasViewTable] = useState<boolean>(true);

  // Relatorio Diagnostico IA records (Relatório Consolidado)
  const [relatorioRecords, setRelatorioRecords] = useState<RelatorioDiagnosticoRecord[]>([]);
  const [hasRelatorioTable, setHasRelatorioTable] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state for diagnostico_ia
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedSetor, setSelectedSetor] = useState('ALL');

  // Detail Modal State
  const [selectedRecord, setSelectedRecord] = useState<DiagnosticoRecord | null>(null);

  // Modals for SQL script and Architecture options
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlModalType, setSqlModalType] = useState<'view' | 'table'>('view');
  const [showAuthOptionsModal, setShowAuthOptionsModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch diagnostico_ia
      const res = await fetch('/api/reports');
      const json = await res.json();
      if (res.ok && json.success) {
        setRecords(json.data || []);
      } else {
        const clientRes = await fetchDiagnosticosFromSupabase();
        if (clientRes.success) {
          setRecords(clientRes.data || []);
        } else {
          setError(clientRes.error || json.error || 'Erro ao carregar os diagnósticos.');
        }
      }

      // 2. Fetch View: vw_relatorio_diagnostico_ia
      try {
        const viewRes = await fetch('/api/reports/view_relatorio');
        const viewJson = await viewRes.json();
        if (viewJson.success && viewJson.data && viewJson.data.length > 0) {
          setViewRecords(viewJson.data);
          setHasViewTable(true);
        } else {
          const clientView = await fetchViewRelatorioFromSupabase();
          if (clientView.success && clientView.data && clientView.data.length > 0) {
            setViewRecords(clientView.data);
            setHasViewTable(true);
          } else {
            setHasViewTable(false);
          }
        }
      } catch {
        setHasViewTable(false);
      }

      // 3. Fetch Tabela Física: relatorio_diagnostico_ia
      try {
        const relRes = await fetch('/api/reports/tabela_relatorio');
        const relJson = await relRes.json();
        if (relJson.success && relJson.data && relJson.data.length > 0) {
          setRelatorioRecords(relJson.data);
          setHasRelatorioTable(true);
        } else {
          const clientRel = await fetchTabelaRelatorioFromSupabase();
          if (clientRel.success && clientRel.data && clientRel.data.length > 0) {
            setRelatorioRecords(clientRel.data);
            setHasRelatorioTable(true);
          } else {
            setHasRelatorioTable(false);
          }
        }
      } catch {
        setHasRelatorioTable(false);
      }

    } catch (err: any) {
      console.warn('Erro ao carregar via API, tentando SDK direto...', err);
      const clientRes = await fetchDiagnosticosFromSupabase();
      if (clientRes.success) {
        setRecords(clientRes.data || []);
      } else {
        setError('Não foi possível conectar ao banco de dados Supabase.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, empresaName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o diagnóstico da empresa "${empresaName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== id));
        showToast(`Diagnóstico de "${empresaName}" excluído com sucesso.`);
        if (selectedRecord?.id === id) {
          setSelectedRecord(null);
        }
      } else {
        const clientRes = await deleteDiagnosticoFromSupabase(id);
        if (clientRes.success) {
          setRecords(prev => prev.filter(r => r.id !== id));
          showToast(`Diagnóstico de "${empresaName}" excluído com sucesso.`);
          if (selectedRecord?.id === id) {
            setSelectedRecord(null);
          }
        } else {
          alert('Erro ao excluir registro.');
        }
      }
    } catch {
      alert('Erro de conexão ao excluir.');
    }
  };

  // Filtered dataset for diagnostico_ia
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch =
        r.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.whatsapp.includes(searchTerm) ||
        (r.setor && r.setor.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage =
        selectedStage === 'ALL' ||
        r.estagio_ia.toLowerCase().includes(selectedStage.toLowerCase());

      const matchesSetor =
        selectedSetor === 'ALL' ||
        r.setor === selectedSetor;

      return matchesSearch && matchesStage && matchesSetor;
    });
  }, [records, searchTerm, selectedStage, selectedSetor]);

  // Unique sectors list for dropdown
  const uniqueSectors = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.setor) set.add(r.setor);
    });
    return Array.from(set);
  }, [records]);

  // Dynamic aggregation for relatorio_diagnostico_ia if table is empty or doesn't exist
  const aggregatedReportBySector = useMemo(() => {
    if (records.length === 0) {
      // Benchmark / Default Sectoral Demonstration when no records exist yet
      return [
        {
          setor: 'Serviços & Consultoria',
          total_empresas: 12,
          media_maturidade: 42,
          estagio_predominante: 'Estágio 2 (Praticante)',
          ferramenta_mais_usada: 'ChatGPT / Claude',
          obstaculo_principal: 'Falta de Tempo / Equipe',
          observacoes: 'Foco na automação de propostas comerciais e relatórios.'
        },
        {
          setor: 'Tecnologia & Software',
          total_empresas: 8,
          media_maturidade: 68,
          estagio_predominante: 'Estágio 3 (Integrador)',
          ferramenta_mais_usada: 'GitHub Copilot / APIs',
          obstaculo_principal: 'Segurança de Dados',
          observacoes: 'Integração de agentes autônomos no atendimento.'
        },
        {
          setor: 'Comércio & Varejo',
          total_empresas: 7,
          media_maturidade: 25,
          estagio_predominante: 'Estágio 1 (Explorador)',
          ferramenta_mais_usada: 'ChatGPT Grátis',
          obstaculo_principal: 'Falta de Treinamento',
          observacoes: 'Treinamento de equipe para criação de cópias e marketing.'
        },
        {
          setor: 'Indústria & Manufatura',
          total_empresas: 5,
          media_maturidade: 30,
          estagio_predominante: 'Estágio 1 (Explorador)',
          ferramenta_mais_usada: 'Excel com IA / BI',
          obstaculo_principal: 'Custo de Implementação',
          observacoes: 'Acompanhar automação de estoque e controle de qualidade.'
        }
      ];
    }

    const map: Record<string, {
      setor: string;
      total_empresas: number;
      scoreSum: number;
      scoreCount: number;
      stages: Record<string, number>;
      tools: Record<string, number>;
      obstacles: Record<string, number>;
    }> = {};

    records.forEach(r => {
      const setorKey = r.setor?.trim() || 'Serviços Gerais / Outros';
      if (!map[setorKey]) {
        map[setorKey] = {
          setor: setorKey,
          total_empresas: 0,
          scoreSum: 0,
          scoreCount: 0,
          stages: {},
          tools: {},
          obstacles: {}
        };
      }

      const item = map[setorKey];
      item.total_empresas += 1;

      // Parse score from classificacao_nivel e.g. "Nível 1 (25%)"
      const match = r.classificacao_nivel?.match(/\((\d+)%\)/);
      if (match) {
        item.scoreSum += parseInt(match[1], 10);
        item.scoreCount += 1;
      }

      if (r.estagio_ia) {
        const shortStage = r.estagio_ia.split('(')[0].trim();
        item.stages[shortStage] = (item.stages[shortStage] || 0) + 1;
      }

      if (r.ferramentas) {
        r.ferramentas.split(',').forEach(t => {
          const cleanTool = t.trim();
          if (cleanTool) {
            item.tools[cleanTool] = (item.tools[cleanTool] || 0) + 1;
          }
        });
      }

      if (r.obstaculo) {
        item.obstacles[r.obstaculo] = (item.obstacles[r.obstaculo] || 0) + 1;
      }
    });

    return Object.values(map).map(item => {
      const media_maturidade = item.scoreCount > 0 ? Math.round(item.scoreSum / item.scoreCount) : 0;
      
      let estagio_predominante = 'Explorador';
      let maxStageCount = 0;
      Object.entries(item.stages).forEach(([stg, count]) => {
        if (count > maxStageCount) {
          maxStageCount = count;
          estagio_predominante = stg;
        }
      });

      let ferramenta_mais_usada = 'ChatGPT / LLMs';
      let maxToolCount = 0;
      Object.entries(item.tools).forEach(([tl, count]) => {
        if (count > maxToolCount) {
          maxToolCount = count;
          ferramenta_mais_usada = tl;
        }
      });

      let obstaculo_principal = 'Falta de Tempo / Conhecimento';
      let maxObsCount = 0;
      Object.entries(item.obstacles).forEach(([obs, count]) => {
        if (count > maxObsCount) {
          maxObsCount = count;
          obstaculo_principal = obs;
        }
      });

      return {
        setor: item.setor,
        total_empresas: item.total_empresas,
        media_maturidade,
        estagio_predominante,
        ferramenta_mais_usada,
        obstaculo_principal,
        observacoes: `Recomendado workshop de automação focado em "${obstaculo_principal.toLowerCase()}".`
      };
    });
  }, [records]);

  // Key KPI stats
  const stats = useMemo(() => {
    const total = records.length;
    if (total === 0) return { total: 0, avgScore: 0, topStage: 'Nenhum', topSector: 'Nenhum' };

    let scoreSum = 0;
    let scoreCount = 0;
    const stageCounts: Record<string, number> = {};
    const sectorCounts: Record<string, number> = {};

    records.forEach(r => {
      const match = r.classificacao_nivel?.match(/\((\d+)%\)/);
      if (match) {
        scoreSum += parseInt(match[1], 10);
        scoreCount++;
      }

      if (r.estagio_ia) {
        const shortStage = r.estagio_ia.split('(')[0].trim();
        stageCounts[shortStage] = (stageCounts[shortStage] || 0) + 1;
      }

      if (r.setor) {
        sectorCounts[r.setor] = (sectorCounts[r.setor] || 0) + 1;
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

    let topStage = 'N/A';
    let maxStageCount = 0;
    Object.entries(stageCounts).forEach(([stage, cnt]) => {
      if (cnt > maxStageCount) {
        maxStageCount = cnt;
        topStage = stage;
      }
    });

    let topSector = 'N/A';
    let maxSectorCount = 0;
    Object.entries(sectorCounts).forEach(([sector, cnt]) => {
      if (cnt > maxSectorCount) {
        maxSectorCount = cnt;
        topSector = sector;
      }
    });

    return { total, avgScore, topStage, topSector };
  }, [records]);

  // Export CSV helper
  const handleExportCSV = () => {
    if (activeTab === 'diagnostico_ia') {
      if (filteredRecords.length === 0) {
        alert('Nenhum registro para exportar.');
        return;
      }

      const headers = [
        'ID',
        'Data Criacao',
        'Nome Contato',
        'WhatsApp',
        'Email',
        'Empresa',
        'Setor',
        'Porte',
        'Estagio IA',
        'Ferramentas',
        'Areas Aplicacao',
        'Obstaculo',
        'Objetivo',
        'Processo Especifico',
        'Classificacao Nivel'
      ];

      const rows = filteredRecords.map(r => [
        `"${r.id}"`,
        `"${new Date(r.created_at).toLocaleString('pt-BR')}"`,
        `"${r.nome || ''}"`,
        `"${r.whatsapp || ''}"`,
        `"${r.email || ''}"`,
        `"${r.empresa || ''}"`,
        `"${r.setor || ''}"`,
        `"${r.porte || ''}"`,
        `"${r.estagio_ia || ''}"`,
        `"${r.ferramentas || ''}"`,
        `"${r.areas_aplicacao || ''}"`,
        `"${r.obstaculo || ''}"`,
        `"${r.objetivo || ''}"`,
        `"${(r.processo_especifico || '').replace(/"/g, '""')}"`,
        `"${r.classificacao_nivel || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tabela_diagnostico_ia_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const dataToExport = hasRelatorioTable && relatorioRecords.length > 0 ? relatorioRecords : aggregatedReportBySector;
      if (dataToExport.length === 0) {
        alert('Nenhum dado consolidado para exportar.');
        return;
      }

      const headers = ['Setor', 'Total Empresas', 'Media Maturidade (%)', 'Estagio Predominante', 'Ferramenta Mais Usada', 'Obstaculo Principal', 'Observacoes'];
      const rows = dataToExport.map(r => [
        `"${r.setor || ''}"`,
        `"${r.total_empresas || 0}"`,
        `"${r.media_maturidade || 0}%"`,
        `"${r.estagio_predominante || ''}"`,
        `"${r.ferramenta_mais_usada || ''}"`,
        `"${r.obstaculo_principal || ''}"`,
        `"${(r.observacoes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vw_relatorio_diagnostico_ia_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const sqlViewCodeSnippet = `-- Script de Criação de VIEW no Supabase
CREATE OR REPLACE VIEW vw_relatorio_diagnostico_ia AS
SELECT 
    COALESCE(NULLIF(TRIM(setor), ''), 'Serviços Gerais / Outros') AS setor,
    COUNT(*)::INTEGER AS total_empresas,
    ROUND(AVG(
        CASE 
            WHEN classificacao_nivel ~ '\\d+%' THEN (substring(classificacao_nivel from '(\\d+)%'))::INTEGER
            WHEN classificacao_nivel ~ '^\\d+$' THEN classificacao_nivel::INTEGER
            ELSE 25
        END
    ))::INTEGER AS media_maturidade,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(estagio_ia), ''), 'Explorador')) AS estagio_predominante,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(ferramentas), ''), 'ChatGPT / LLMs')) AS ferramenta_mais_usada,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(obstaculo), ''), 'Falta de Tempo')) AS obstaculo_principal,
    MODE() WITHIN GROUP (ORDER BY COALESCE(NULLIF(TRIM(objetivo), ''), 'Aumentar Produtividade')) AS observacoes
FROM diagnostico_ia
GROUP BY COALESCE(NULLIF(TRIM(setor), ''), 'Serviços Gerais / Outros');`;

  const sqlTableCodeSnippet = `-- Script de Criação da TABELA FÍSICA no Supabase
CREATE TABLE IF NOT EXISTS relatorio_diagnostico_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    setor VARCHAR(255),
    total_empresas INTEGER,
    media_maturidade INTEGER,
    estagio_predominante VARCHAR(255),
    ferramenta_mais_usada VARCHAR(255),
    obstaculo_principal VARCHAR(255),
    observacoes TEXT
);`;

  const copySql = (textToCopy?: string) => {
    const text = textToCopy || sqlViewCodeSnippet;
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className={`bg-[#1E293B] text-slate-100 min-h-screen ${isModal ? 'p-4 sm:p-6 lg:p-8 rounded-2xl max-w-7xl mx-auto my-6 shadow-2xl border border-slate-700/80' : 'p-4 sm:p-8'}`}>
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#349885] text-white font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce text-xs sm:text-sm border border-[#2C8070]">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#349885] font-bold text-xs uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            Flávio Santiago ConsultorIA • Módulo Administrativo
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-light">
            Painel Geral de <span className="italic text-[#349885] font-serif">Gestão & Inteligência</span>
          </h1>
          <p className="text-[#A0B2C6] text-xs sm:text-sm mt-1">
            Módulo restrito do consultor para análise detalhada e emissão de relatórios estratégicos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAuthOptionsModal(true)}
            className="bg-[#2A3A4A] hover:bg-slate-700 text-[#E2C08D] border border-[#D1A05A]/40 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition flex items-center gap-1.5"
            title="Ver arquitetura de separação entre formulário livre e login do admin"
          >
            <Lock className="w-3.5 h-3.5 text-[#D1A05A]" />
            Opções de Login ADM
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#349885]' : ''}`} />
            Atualizar
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-[#349885] hover:bg-[#2C8070] text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-full transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD TAB SWITCHER WITH ATTRACTIVE LABELS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#2A3A4A] p-2 rounded-2xl border border-slate-700/80 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Respostas dos Clientes */}
          <button
            onClick={() => setActiveTab('diagnostico_ia')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'diagnostico_ia'
                ? 'bg-[#349885] text-white shadow-md'
                : 'text-[#A0B2C6] hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Table className="w-4 h-4" />
            Diagnósticos Individuais
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'diagnostico_ia' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {records.length}
            </span>
          </button>

          {/* Tab 2: Inteligência Setorial (View) */}
          <button
            onClick={() => setActiveTab('vw_relatorio_diagnostico_ia')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'vw_relatorio_diagnostico_ia'
                ? 'bg-[#349885] text-white shadow-md'
                : 'text-[#A0B2C6] hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Inteligência Setorial (View)
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'vw_relatorio_diagnostico_ia' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {hasViewTable && viewRecords.length > 0 ? viewRecords.length : aggregatedReportBySector.length}
            </span>
          </button>

          {/* Tab 3: Relatório Consolidado (Tabela) */}
          <button
            onClick={() => setActiveTab('relatorio_diagnostico_ia')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'relatorio_diagnostico_ia'
                ? 'bg-[#349885] text-white shadow-md'
                : 'text-[#A0B2C6] hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Relatório Consolidado (Tabela)
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'relatorio_diagnostico_ia' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {hasRelatorioTable && relatorioRecords.length > 0 ? relatorioRecords.length : aggregatedReportBySector.length}
            </span>
          </button>
        </div>

        <div className="text-right px-2 hidden lg:block">
          <span className="text-[11px] text-[#A0B2C6]">
            {activeTab === 'diagnostico_ia'
              ? 'Exibindo formulários individuais preenchidos pelos clientes'
              : activeTab === 'vw_relatorio_diagnostico_ia'
              ? 'Exibindo inteligência calculada automaticamente por setor'
              : 'Exibindo dados persistidos na tabela `relatorio_diagnostico_ia`'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#2A3A4A]/80 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0B2C6] block mb-1">
            Total de Diagnósticos
          </span>
          <div className="text-3xl sm:text-4xl font-serif text-white font-light my-1 flex items-baseline gap-2">
            {stats.total}
            <span className="text-xs font-sans text-[#A0B2C6] font-normal">respostas</span>
          </div>
          <span className="text-[11px] text-[#349885] font-medium">
            Registrados na tabela `diagnostico_ia`
          </span>
        </div>

        <div className="bg-[#2A3A4A]/80 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0B2C6] block mb-1">
            Média de Maturidade em IA
          </span>
          <div className="text-3xl sm:text-4xl font-serif italic text-[#349885] font-light my-1">
            {stats.avgScore}%
          </div>
          <span className="text-[11px] text-[#A0B2C6] font-medium">
            Índice médio das empresas
          </span>
        </div>

        <div className="bg-[#2A3A4A]/80 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0B2C6] block mb-1">
            Estágio Predominante
          </span>
          <div className="text-xl font-serif text-[#D1A05A] font-normal truncate my-1">
            {stats.topStage}
          </div>
          <span className="text-[11px] text-[#A0B2C6] font-medium">
            Maior concentração de nível
          </span>
        </div>

        <div className="bg-[#2A3A4A]/80 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0B2C6] block mb-1">
            Principal Setor
          </span>
          <div className="text-xl font-serif text-[#349885] font-normal truncate my-1">
            {stats.topSector}
          </div>
          <span className="text-[11px] text-[#A0B2C6] font-medium">
            Setor com mais participações
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="underline font-bold text-red-300 hover:text-white shrink-0 ml-4"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* TAB 1: diagnostico_ia (Respostas Brutas) */}
      {activeTab === 'diagnostico_ia' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Filter and Search Bar */}
          <div className="bg-[#2A3A4A]/60 border border-slate-700/60 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#A0B2C6] absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por empresa, nome, e-mail, telefone ou setor..."
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#349885] outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="w-full md:w-48">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-[#349885] outline-none cursor-pointer"
              >
                <option value="ALL">Todos os Estágios</option>
                <option value="Estágio 0">Estágio 0 (Curioso)</option>
                <option value="Estágio 1">Estágio 1 (Explorador)</option>
                <option value="Estágio 2">Estágio 2 (Praticante)</option>
                <option value="Estágio 3">Estágio 3 (Integrador)</option>
                <option value="Estágio 4">Estágio 4 (Avançado)</option>
              </select>
            </div>

            <div className="w-full md:w-44">
              <select
                value={selectedSetor}
                onChange={(e) => setSelectedSetor(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-[#349885] outline-none cursor-pointer"
              >
                <option value="ALL">Todos os Setores</option>
                {uniqueSectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Table diagnostico_ia */}
          <div className="bg-[#2A3A4A]/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-[#A0B2C6] space-y-3">
                <RefreshCw className="w-8 h-8 text-[#349885] animate-spin mx-auto" />
                <p className="text-sm font-medium">Carregando dados da tabela diagnostico_ia...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center text-[#A0B2C6] space-y-3">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-serif text-slate-200">Nenhum registro em diagnostico_ia</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {records.length === 0
                    ? 'Ainda não há diagnósticos cadastrados nesta base do Supabase. Preencha o formulário para gerar o primeiro registro!'
                    : 'Nenhuma empresa corresponde aos filtros aplicados.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/80 bg-[#1E293B]/80 text-[#A0B2C6] text-[10px] uppercase tracking-widest font-bold">
                      <th className="p-4">Data</th>
                      <th className="p-4">Empresa / Porte</th>
                      <th className="p-4">Responsável / Contato</th>
                      <th className="p-4">Estágio de IA</th>
                      <th className="p-4">Maturidade</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.map((record) => {
                      const dateFormatted = record.created_at
                        ? new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : 'N/A';

                      const whatsappClean = record.whatsapp ? record.whatsapp.replace(/\D/g, '') : '';
                      const waUrl = whatsappClean ? `https://wa.me/55${whatsappClean}` : null;

                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <td className="p-4 text-[#A0B2C6] font-mono text-[11px] whitespace-nowrap">
                            {dateFormatted}
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-white text-sm group-hover:text-[#349885] transition-colors">
                              {record.empresa}
                            </div>
                            <div className="text-[11px] text-[#A0B2C6] flex items-center gap-2 mt-0.5">
                              <span>{record.setor || 'Setor N/I'}</span>
                              {record.porte && (
                                <>
                                  <span>•</span>
                                  <span>{record.porte}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-medium text-slate-200">
                              {record.nome}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] text-[#A0B2C6]">
                              {waUrl ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[#349885] hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <Phone className="w-3 h-3" />
                                  {record.whatsapp}
                                </a>
                              ) : (
                                <span>{record.whatsapp}</span>
                              )}
                              <span className="text-slate-400 truncate max-w-[180px]">
                                {record.email}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="inline-block bg-[#349885]/15 text-[#349885] border border-[#349885]/30 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              {record.estagio_ia || 'N/A'}
                            </span>
                          </td>

                          <td className="p-4 font-mono font-bold text-[#D1A05A]">
                            {record.classificacao_nivel || '—'}
                          </td>

                          <td className="p-4 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                              title="Ver detalhes completos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(record.id, record.empresa)}
                              className="p-2 bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 rounded-lg transition"
                              title="Excluir do Supabase"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: vw_relatorio_diagnostico_ia (Inteligência Setorial em View) */}
      {activeTab === 'vw_relatorio_diagnostico_ia' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Informative Banner */}
          <div className="bg-[#2A3A4A]/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#349885]/20 text-[#349885] flex items-center justify-center shrink-0 mt-0.5">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  Panorama de Maturidade por Setor (`vw_relatorio_diagnostico_ia`)
                  {hasViewTable && viewRecords.length > 0 ? (
                    <span className="px-2 py-0.5 bg-[#349885]/20 text-[#349885] border border-[#349885]/30 text-[10px] rounded-full font-bold">
                      View SQL Nativa Supabase
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#D1A05A]/20 text-[#E2C08D] border border-[#D1A05A]/30 text-[10px] rounded-full font-bold">
                      Agregação Dinâmica em Tempo Real
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#A0B2C6] mt-0.5">
                  Esta visualização calcula os consolidados de maturidade, ferramenta de destaque e gargalos agregados por setor de atuação.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSqlModalType('view');
                setShowSqlModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5 text-[#349885]" />
              Ver Script SQL da View
            </button>
          </div>

          {/* Lista em Tabela */}
          <div className="bg-[#2A3A4A]/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-[#A0B2C6] space-y-3">
                <RefreshCw className="w-8 h-8 text-[#349885] animate-spin mx-auto" />
                <p className="text-sm font-medium">Calculando panorama por setor...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/80 bg-[#1E293B]/80 text-[#A0B2C6] text-[10px] uppercase tracking-widest font-bold">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Setor de Atuação</th>
                      <th className="p-4 text-center">Empresas</th>
                      <th className="p-4 text-center">Maturidade (%)</th>
                      <th className="p-4">Estágio Predominante</th>
                      <th className="p-4">Ferramenta Destaque</th>
                      <th className="p-4">Gargalo Principal</th>
                      <th className="p-4">Observação / Recomendação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(hasViewTable && viewRecords.length > 0 ? viewRecords : aggregatedReportBySector).map((item, index) => (
                      <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-center font-mono text-slate-500 font-bold">
                          0{index + 1}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#349885] shrink-0" />
                            {item.setor || 'Serviços Gerais'}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Setor Analisado
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-800 text-slate-100 font-mono font-bold text-xs border border-slate-700">
                            {item.total_empresas || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="font-mono font-bold text-base text-[#349885]">
                            {item.media_maturidade || 0}%
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="inline-block bg-[#349885]/15 text-[#349885] border border-[#349885]/30 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            {item.estagio_predominante || 'Explorador'}
                          </span>
                        </td>

                        <td className="p-4 font-medium text-slate-200">
                          {item.ferramenta_mais_usada || 'ChatGPT'}
                        </td>

                        <td className="p-4 font-medium text-amber-300">
                          {item.obstaculo_principal || 'Falta de Tempo'}
                        </td>

                        <td className="p-4 text-[#A0B2C6] text-xs italic max-w-xs">
                          {item.observacoes || 'Treinamento de automação focado no setor.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-[#2A3A4A]/50 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between text-xs text-[#A0B2C6]">
            <span>
              Exibindo <strong>{(hasViewTable && viewRecords.length > 0 ? viewRecords : aggregatedReportBySector).length}</strong> setores em `vw_relatorio_diagnostico_ia`.
            </span>

            <button
              onClick={handleExportCSV}
              className="text-[#349885] hover:text-[#2C8070] font-bold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar CSV da View
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: relatorio_diagnostico_ia (Tabela Física Consolidada) */}
      {activeTab === 'relatorio_diagnostico_ia' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Informative Banner */}
          <div className="bg-[#2A3A4A]/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D1A05A]/20 text-[#D1A05A] flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  Relatório Consolidado Persistido (`relatorio_diagnostico_ia`)
                  {hasRelatorioTable && relatorioRecords.length > 0 ? (
                    <span className="px-2 py-0.5 bg-[#349885]/20 text-[#349885] border border-[#349885]/30 text-[10px] rounded-full font-bold">
                      Tabela Física Nativa Supabase
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#D1A05A]/20 text-[#E2C08D] border border-[#D1A05A]/30 text-[10px] rounded-full font-bold">
                      Lista Demonstrativa Local
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#A0B2C6] mt-0.5">
                  Esta tabela armazena fisicamente no Supabase os dados agregados dos relatórios por setor em formato de lista simples.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSqlModalType('table');
                setShowSqlModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5 text-[#D1A05A]" />
              Ver Script SQL da Tabela
            </button>
          </div>

          {/* Lista Simples em Tabela */}
          <div className="bg-[#2A3A4A]/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-[#A0B2C6] space-y-3">
                <RefreshCw className="w-8 h-8 text-[#349885] animate-spin mx-auto" />
                <p className="text-sm font-medium">Carregando tabela consolidada...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/80 bg-[#1E293B]/80 text-[#A0B2C6] text-[10px] uppercase tracking-widest font-bold">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Setor de Atuação</th>
                      <th className="p-4 text-center">Total Empresas</th>
                      <th className="p-4 text-center">Maturidade (%)</th>
                      <th className="p-4">Estágio Principal</th>
                      <th className="p-4">Ferramenta Destaque</th>
                      <th className="p-4">Gargalo Principal</th>
                      <th className="p-4">Observação / Recomendação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(hasRelatorioTable && relatorioRecords.length > 0 ? relatorioRecords : aggregatedReportBySector).map((item, index) => (
                      <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-center font-mono text-slate-500 font-bold">
                          0{index + 1}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#D1A05A] shrink-0" />
                            {item.setor || 'Serviços Gerais'}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Setor Registrado
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-800 text-slate-100 font-mono font-bold text-xs border border-slate-700">
                            {item.total_empresas || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="font-mono font-bold text-base text-[#D1A05A]">
                            {item.media_maturidade || 0}%
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="inline-block bg-[#D1A05A]/15 text-[#E2C08D] border border-[#D1A05A]/30 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            {item.estagio_predominante || 'Explorador'}
                          </span>
                        </td>

                        <td className="p-4 font-medium text-slate-200">
                          {item.ferramenta_mais_usada || 'ChatGPT'}
                        </td>

                        <td className="p-4 font-medium text-amber-300">
                          {item.obstaculo_principal || 'Falta de Tempo'}
                        </td>

                        <td className="p-4 text-[#A0B2C6] text-xs italic max-w-xs">
                          {item.observacoes || 'Acompanhar automação e plano de ação.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-[#2A3A4A]/50 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between text-xs text-[#A0B2C6]">
            <span>
              Exibindo <strong>{(hasRelatorioTable && relatorioRecords.length > 0 ? relatorioRecords : aggregatedReportBySector).length}</strong> registros da tabela `relatorio_diagnostico_ia`.
            </span>

            <button
              onClick={handleExportCSV}
              className="text-[#D1A05A] hover:text-[#b88c4b] font-bold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar CSV da Tabela
            </button>
          </div>

        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED COMPANY */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl relative animate-fade-in">
            
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#349885] block mb-1">
                Ficha Individual de Diagnóstico
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-white font-light">
                {selectedRecord.empresa}
              </h2>
              <p className="text-xs text-[#A0B2C6] mt-1">
                Cadastrado em: {new Date(selectedRecord.created_at).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#2A3A4A] p-4 rounded-xl border border-slate-700/80 text-xs">
              <div>
                <span className="text-[#A0B2C6] block font-bold text-[10px] uppercase mb-0.5">Contato</span>
                <span className="font-semibold text-white text-sm">{selectedRecord.nome}</span>
              </div>

              <div>
                <span className="text-[#A0B2C6] block font-bold text-[10px] uppercase mb-0.5">E-mail</span>
                <span className="text-slate-200">{selectedRecord.email}</span>
              </div>

              <div>
                <span className="text-[#A0B2C6] block font-bold text-[10px] uppercase mb-0.5">WhatsApp</span>
                {selectedRecord.whatsapp ? (
                  <a
                    href={`https://wa.me/55${selectedRecord.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#349885] hover:underline font-bold flex items-center gap-1 text-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selectedRecord.whatsapp}
                  </a>
                ) : 'N/A'}
              </div>

              <div>
                <span className="text-[#A0B2C6] block font-bold text-[10px] uppercase mb-0.5">Setor & Porte</span>
                <span className="text-slate-200">{selectedRecord.setor || 'N/I'} • {selectedRecord.porte || 'N/I'}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[#A0B2C6] uppercase tracking-wider font-bold text-[10px] block mb-1">Estágio Atual de Uso</span>
                <p className="text-sm font-semibold text-[#349885]">{selectedRecord.estagio_ia}</p>
                <span className="text-[11px] font-mono text-[#D1A05A] mt-0.5 block">{selectedRecord.classificacao_nivel}</span>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <span className="text-[#A0B2C6] uppercase tracking-wider font-bold text-[10px] block mb-1">Ferramentas de IA Utilizadas</span>
                <p className="text-slate-200 font-medium">{selectedRecord.ferramentas || 'Nenhuma ferramenta informada'}</p>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <span className="text-[#A0B2C6] uppercase tracking-wider font-bold text-[10px] block mb-1">Áreas de Aplicação</span>
                <p className="text-slate-200 font-medium">{selectedRecord.areas_aplicacao || 'Nenhuma área selecionada'}</p>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <span className="text-[#A0B2C6] uppercase tracking-wider font-bold text-[10px] block mb-1">Maior Obstáculo</span>
                <p className="text-[#D1A05A] font-medium">{selectedRecord.obstaculo || 'Nenhum informado'}</p>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <span className="text-[#A0B2C6] uppercase tracking-wider font-bold text-[10px] block mb-1">Objetivo Principal</span>
                <p className="text-[#349885] font-medium">{selectedRecord.objetivo || 'Nenhum informado'}</p>
              </div>

              <div>
                <span className="text-[#A0B2C6] uppercase tracking-wider font-bold text-[10px] block mb-1">Processo Específico para Automatizar</span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 italic">
                  "{selectedRecord.processo_especifico || 'Nenhum processo específico descrito pelo participante.'}"
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => handleDelete(selectedRecord.id, selectedRecord.empresa)}
                className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Registro
              </button>

              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL CODE MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-slate-100 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowSqlModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#349885]/20 text-[#349885] flex items-center justify-center shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {sqlModalType === 'view' ? 'Script SQL para `vw_relatorio_diagnostico_ia`' : 'Script SQL para `relatorio_diagnostico_ia`'}
                </h3>
                <p className="text-xs text-[#A0B2C6]">
                  Execute este código no SQL Editor do Supabase para criar o objeto correspondente.
                </p>
              </div>
            </div>

            <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <pre>{sqlModalType === 'view' ? sqlViewCodeSnippet : sqlTableCodeSnippet}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#A0B2C6]">
                {sqlModalType === 'view'
                  ? 'Cria uma VIEW reativa baseada nos dados inseridos em `diagnostico_ia`.'
                  : 'Cria a TABELA FÍSICA para persistência de relatórios consolidados.'}
              </span>
              <button
                onClick={() => copySql(sqlModalType === 'view' ? sqlViewCodeSnippet : sqlTableCodeSnippet)}
                className="bg-[#349885] hover:bg-[#2C8070] text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSql ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH & ACCESS SEPARATION OPTIONS MODAL */}
      {showAuthOptionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowAuthOptionsModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D1A05A]/20 text-[#E2C08D] border border-[#D1A05A]/30 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D1A05A] block mb-0.5">
                  Arquitetura de Segurança & Acesso
                </span>
                <h3 className="text-2xl font-serif text-white font-light">
                  Separação: Diagnóstico Livre vs. Módulo ADM
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#A0B2C6] leading-relaxed">
              O formulário público de <strong>Diagnóstico de Maturidade em IA</strong> deve ser 100% aberto e sem fricção (sem login). Já o <strong>Módulo ADM</strong> terá tela de autenticação para o consultor.
            </p>

            <div className="space-y-4">
              {/* Option 1 */}
              <div className="bg-[#2A3A4A] p-4 sm:p-5 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#349885] text-white flex items-center justify-center text-xs">1</span>
                  Opção 1: Separação por Rotas e Guard de Login (Recomendada)
                </div>
                <p className="text-xs text-[#A0B2C6] pl-8 leading-relaxed">
                  • <strong>URL Pública (`/`)</strong>: Renderiza apenas o formulário interativo de diagnóstico. Qualquer empresário acessa e responde sem autenticação.<br />
                  • <strong>URL Administrativa (`/admin`)</strong>: Exibe um formulário de login (e-mail/senha). Ao autenticar com sucesso, o estado de sessão do React armazena o token e libera acesso às tabelas `diagnostico_ia` e `relatorio_diagnostico_ia`.
                </p>
              </div>

              {/* Option 2 */}
              <div className="bg-[#2A3A4A] p-4 sm:p-5 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#349885] text-white flex items-center justify-center text-xs">2</span>
                  Opção 2: Autenticação via Supabase Auth & RLS (Row Level Security)
                </div>
                <p className="text-xs text-[#A0B2C6] pl-8 leading-relaxed">
                  • O público insere registros usando a chave pública (RLS apenas para `INSERT ON diagnostico_ia`).<br />
                  • O consultor realiza login com `supabase.auth.signInWithPassword()` na área ADM. Apenas a role autenticada possui permissão de `SELECT` e `DELETE` nas tabelas do banco de dados.
                </p>
              </div>

              {/* Option 3 */}
              <div className="bg-[#2A3A4A] p-4 sm:p-5 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#349885] text-white flex items-center justify-center text-xs">3</span>
                  Opção 3: PIN / Chave Mestre de Acesso Rápido
                </div>
                <p className="text-xs text-[#A0B2C6] pl-8 leading-relaxed">
                  • Um modal com PIN/senha administrativa rápida (ex: <i>Master Password</i>) armazenada no servidor Express (`server.ts`). Útil para apresentações ao vivo sem complexidade de cadastro de usuários.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setShowAuthOptionsModal(false)}
                className="bg-[#349885] hover:bg-[#2C8070] text-white font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
