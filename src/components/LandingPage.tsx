import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  FileSpreadsheet, 
  Bot, 
  Compass, 
  Award,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { ESTAGIOS_IA } from '../data/stages';

interface LandingPageProps {
  onStartDiagnosis: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDiagnosis }) => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#349885]/10 via-transparent to-transparent pointer-events-none -z-10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#349885]/10 border border-[#349885]/20 text-[#349885] text-xs font-semibold tracking-wide uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#349885]" />
            Diagnóstico Executivo de Maturidade Digital
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#1E293B] tracking-tight leading-[1.15]">
            Descubra o nível real de <br className="hidden sm:inline" />
            <span className="text-[#349885] italic">adoção de IA</span> na sua empresa
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg lg:text-xl text-[#475569] max-w-2xl mx-auto leading-relaxed font-normal">
            Em menos de <strong>5 minutos</strong>, avalie seus gargalos operacionais e receba um plano estratégico personalizado com ferramentas e automações recomendadas para o seu setor.
          </p>

          {/* CTA Group */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartDiagnosis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#349885] hover:bg-[#2c8271] active:scale-[0.98] text-white font-semibold text-base sm:text-lg rounded-2xl shadow-lg shadow-[#349885]/25 transition-all duration-200 cursor-pointer group"
            >
              <span>Iniciar Diagnóstico Gratuito</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-xs sm:text-sm text-[#64748B]">
            <span className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-[#349885]" />
              Em menos de 5 minutos
            </span>
            <span className="flex items-center gap-2 font-medium">
              <Bot className="w-4 h-4 text-[#349885]" />
              Análise com Inteligência Artificial
            </span>
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#349885]" />
              100% Gratuito & Confidencial
            </span>
          </div>

        </div>
      </section>

      {/* 3 Steps Process Explanation */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-serif text-[#1E293B]">
            Como funciona a avaliação?
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Um processo guiado e sem termos técnicos complexos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-[#349885]/40 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#349885]/10 text-[#349885] flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-2">
              Contexto do Negócio
            </h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Informe seu setor de atuação, porte da empresa e canais de contato executivo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-[#349885]/40 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#349885]/10 text-[#349885] flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-2">
              Mapeamento de Uso
            </h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Identifique ferramentas já experimentadas e o nível de rotina com Inteligência Artificial.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-[#349885]/40 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#349885]/10 text-[#349885] flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-2">
              Plano de Ação Executivo
            </h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Receba um relatório com diagnóstico de maturidade e recomendações para implementar.
            </p>
          </div>

        </div>
      </section>

      {/* 5 Levels Overview */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#2A3A4A] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#349885]" />
              <h3 className="text-xl sm:text-2xl font-serif">
                Os 5 Níveis de Maturidade Empresarial
              </h3>
            </div>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Nossa metodologia classifica a sua operação em uma das 5 fases de adoção tecnológica:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {ESTAGIOS_IA.map((s) => (
                <div key={s.id} className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#349885] uppercase tracking-wider">Nível {s.nivel}</span>
                    <span className="text-slate-400 font-mono">{s.badge}</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm">{s.titulo}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">{s.subtitulo}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={onStartDiagnosis}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#349885] hover:bg-[#2c8271] text-white font-medium text-sm rounded-xl transition shadow-md cursor-pointer"
              >
                <span>Descobrir o Nível da Minha Empresa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Consultant Footer Signature */}
      <section className="py-8 text-center text-xs text-[#64748B] border-t border-slate-200/60 mt-10">
        <p className="font-medium text-[#475569]">
          Metodologia desenvolvida por <strong>Flávio Santiago ConsultorIA</strong>
        </p>
        <p className="text-[11px] mt-1 text-[#94A3B8]">
          Consultoria estratégica em Inteligência Artificial, automação de processos e eficiência operacional.
        </p>
      </section>
    </div>
  );
};
