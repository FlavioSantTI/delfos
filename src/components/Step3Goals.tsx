import React from 'react';
import { ArrowLeft, Loader2, Send, ShieldCheck } from 'lucide-react';
import { FormData } from '../types';
import { OBSTACULOS, OBJETIVOS } from '../data/stages';

interface Step3Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export const Step3Goals: React.FC<Step3Props> = ({
  formData,
  onChange,
  onSubmit,
  onBack,
  isSubmitting,
  errors
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-3xl sm:text-4xl font-light font-serif text-[#1E293B] mb-2">
          Objetivos <span className="text-[#349885] italic font-serif">Finais</span>
        </h2>
        <p className="text-[#64748B] text-sm">
          O que sua empresa espera alcançar com a Inteligência Artificial?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Principal Obstáculo */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Principal Obstáculo *
          </label>
          <select
            value={formData.obstaculo}
            onChange={(e) => onChange('obstaculo', e.target.value)}
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium cursor-pointer ${
              errors.obstaculo ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          >
            <option value="">Selecione o obstáculo...</option>
            {OBSTACULOS.map((obs) => (
              <option key={obs} value={obs}>{obs}</option>
            ))}
          </select>
          {errors.obstaculo && <p className="text-xs text-red-500 mt-1 font-medium">{errors.obstaculo}</p>}
        </div>

        {/* Objetivo Principal */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Objetivo Principal *
          </label>
          <select
            value={formData.objetivo}
            onChange={(e) => onChange('objetivo', e.target.value)}
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium cursor-pointer ${
              errors.objetivo ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          >
            <option value="">Selecione o objetivo...</option>
            {OBJETIVOS.map((obj) => (
              <option key={obj} value={obj}>{obj}</option>
            ))}
          </select>
          {errors.objetivo && <p className="text-xs text-red-500 mt-1 font-medium">{errors.objetivo}</p>}
        </div>

        {/* Processo Específico (Textarea Opcional) */}
        <div className="col-span-1 sm:col-span-2 space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Processo para Automatizar (Opcional)
          </label>
          <textarea
            value={formData.processo}
            onChange={(e) => onChange('processo', e.target.value)}
            rows={3}
            placeholder="Descreva um processo manual que toma muito tempo da sua equipe no dia a dia..."
            className="w-full border border-[#E2E8F0] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none p-3.5 rounded-xl text-sm font-medium bg-[#F8FAFC] focus:bg-white text-[#1E293B] placeholder-[#94A3B8] transition-all"
          />
        </div>

        {/* Termo de Conformidade LGPD */}
        <div className="col-span-1 sm:col-span-2 mt-2">
          <div className={`p-4 rounded-2xl border transition-all ${
            errors.lgpdConsent ? 'bg-red-50/40 border-red-300' : 'bg-[#F8FAFC] border-slate-200/80'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.lgpdConsent === true}
                onChange={(e) => onChange('lgpdConsent', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#349885] rounded border-slate-300 focus:ring-[#349885] cursor-pointer shrink-0"
              />
              <div className="text-xs leading-relaxed text-[#475569]">
                <span className="font-bold text-[#1E293B] flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#349885] shrink-0 inline" />
                  Privacidade & Conformidade LGPD (Lei nº 13.709/2018)
                </span>
                Concordo com o tratamento dos dados informados para geração do relatório de diagnóstico de maturidade em IA, contato do consultor e automações operacionais (incluindo WhatsApp e ferramentas internas). Os dados não serão vendidos. Posso solicitar exclusão pelos canais do consultor.
              </div>
            </label>
            {errors.lgpdConsent && (
              <p className="text-xs text-red-500 mt-2 font-medium ml-7">{errors.lgpdConsent}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Submit Buttons */}
      <div className="pt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-[#64748B] hover:text-[#1E293B] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#349885] hover:bg-[#2C8070] text-white font-bold py-3.5 px-8 sm:px-10 rounded-full transition-all shadow-xs uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <span>Gerar Diagnóstico</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

