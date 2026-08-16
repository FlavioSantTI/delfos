import React, { useState, useRef, useEffect } from 'react';
import { Database, Code2, Sparkles, BarChart3, FileText, Settings, ChevronDown, ExternalLink, Lock, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { APP_VERSION_LABEL } from '../version';

interface HeaderProps {
  onOpenIntegrationModal: () => void;
  onOpenHtmlModal: () => void;
  isConfigured: boolean;
  currentTab: 'diagnostico' | 'relatorio';
  onTabChange: (tab: 'diagnostico' | 'relatorio') => void;
  isAdminMode: boolean;
  onToggleAdminMode: (admin: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIntegrationModal,
  onOpenHtmlModal,
  isConfigured,
  currentTab,
  onTabChange,
  isAdminMode,
  onToggleAdminMode
}) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#2A3A4A] text-white border-b border-slate-700/60 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start py-1">
          <div 
            className="flex items-center gap-3.5 cursor-pointer group" 
            onClick={() => onTabChange('diagnostico')}
          >
            <Logo size={48} variant="mark" />
            <div>
              <h1 className="text-base sm:text-xl lg:text-2xl tracking-tight text-white font-serif leading-snug">
                <span className="font-bold font-serif">DelfosIA</span>
                <span className="text-[#A0B2C6] font-sans font-light mx-1.5">—</span>
                <span className="text-slate-100 font-sans font-normal text-sm sm:text-base lg:text-lg">
                  Diagnóstico, predição e acompanhamento de maturidade
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#A0B2C6] font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#349885]"></span>
                by <strong className="text-white font-semibold tracking-normal">Flávio Santiago ConsultorIA</strong>
                <span className="text-[#A0B2C6]/70 font-normal">· {APP_VERSION_LABEL}</span>
              </p>
            </div>
          </div>

          {/* Admin badge if in admin mode */}
          {isAdminMode && (
            <span className="sm:hidden px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D1A05A]/20 text-[#E2C08D] border border-[#D1A05A]/30">
              Modo Admin
            </span>
          )}
        </div>

        {/* Public Form Mode Header - 100% Clean! */}
        {!isAdminMode ? (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Discrete access to admin */}
            <button
              onClick={() => onToggleAdminMode(true)}
              className="text-[#A0B2C6]/60 hover:text-white p-1.5 rounded-lg transition-colors ml-1"
              title="Acesso Restrito do Consultor (Admin)"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Admin Mode Controls */
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Tab switchers in admin */}
            <div className="bg-slate-900/90 p-1 rounded-full border border-slate-700/80 flex items-center">
              <button
                onClick={() => onTabChange('relatorio')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                  currentTab === 'relatorio'
                    ? 'bg-[#349885] text-white shadow-xs'
                    : 'text-[#A0B2C6] hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Relatórios
              </button>

              <button
                onClick={() => onTabChange('diagnostico')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                  currentTab === 'diagnostico'
                    ? 'bg-[#349885] text-white shadow-xs'
                    : 'text-[#A0B2C6] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Preview Form
              </button>
            </div>

            {/* Dev / Admin Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#A0B2C6] hover:text-white bg-slate-800/80 hover:bg-slate-800 transition border border-slate-700/80"
                title="Configurações e Infraestrutura"
              >
                <Settings className="w-3.5 h-3.5 text-[#349885]" />
                <span className="hidden sm:inline">⚙ Infra & Dev</span>
                <ChevronDown className={`w-3 h-3 text-[#A0B2C6] transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAdminOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#2A3A4A] border border-slate-700/80 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-white">
                  <div className="px-3.5 py-1.5 border-b border-slate-700/60 text-[10px] font-bold uppercase tracking-widest text-[#A0B2C6] flex items-center justify-between">
                    <span>Painel de Infraestrutura</span>
                    <span className="text-[#349885] text-[9px] font-semibold">Online</span>
                  </div>

                  <button
                    onClick={() => {
                      onOpenIntegrationModal();
                      setIsAdminOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#349885]" />
                      Supabase & n8n Config
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {isConfigured ? 'Ativo' : 'Local'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenHtmlModal();
                      setIsAdminOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center gap-2 transition"
                  >
                    <Code2 className="w-4 h-4 text-[#349885]" />
                    Gerar Código HTML Único
                  </button>

                  <div className="my-1 border-t border-slate-700/60"></div>

                  <button
                    onClick={() => {
                      onToggleAdminMode(false);
                      setIsAdminOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-[#E2C08D] hover:bg-slate-800/80 flex items-center gap-2 transition font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Sair do Modo Admin (Ver Form Público)
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </header>
  );
};




