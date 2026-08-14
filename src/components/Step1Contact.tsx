import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FormData } from '../types';
import { SETORES, PORTES_EMPRESA } from '../data/stages';
import { formatWhatsApp } from '../utils/mask';

interface Step1Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export const Step1Contact: React.FC<Step1Props> = ({
  formData,
  onChange,
  onNext,
  errors
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    onChange('whatsapp', formatted);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-3xl sm:text-4xl font-light font-serif text-[#1E293B] mb-2">
          Perfil <span className="text-[#349885] italic font-serif">Comercial</span>
        </h2>
        <p className="text-[#64748B] text-sm">
          Identifique sua empresa para iniciarmos o diagnóstico de maturidade.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => onChange('nome', e.target.value)}
            placeholder="Ex: João Silva"
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] placeholder-[#94A3B8] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium ${
              errors.nome ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          />
          {errors.nome && <p className="text-xs text-red-500 mt-1 font-medium">{errors.nome}</p>}
        </div>

        {/* WhatsApp */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            WhatsApp *
          </label>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={handlePhoneChange}
            placeholder="(11) 99999-9999"
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] placeholder-[#94A3B8] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium ${
              errors.whatsapp ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          />
          {errors.whatsapp && <p className="text-xs text-red-500 mt-1 font-medium">{errors.whatsapp}</p>}
        </div>

        {/* E-mail */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            E-mail Corporativo *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="joao@empresa.com.br"
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] placeholder-[#94A3B8] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium ${
              errors.email ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Nome da Empresa */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Nome da Empresa *
          </label>
          <input
            type="text"
            value={formData.empresa}
            onChange={(e) => onChange('empresa', e.target.value)}
            placeholder="Sua Empresa LTDA"
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] placeholder-[#94A3B8] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium ${
              errors.empresa ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          />
          {errors.empresa && <p className="text-xs text-red-500 mt-1 font-medium">{errors.empresa}</p>}
        </div>

        {/* Setor */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Setor de Atuação *
          </label>
          <select
            value={formData.setor}
            onChange={(e) => onChange('setor', e.target.value)}
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium cursor-pointer ${
              errors.setor ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          >
            <option value="">Selecione o setor...</option>
            {SETORES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.setor && <p className="text-xs text-red-500 mt-1 font-medium">{errors.setor}</p>}
        </div>

        {/* Porte */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
            Porte da Empresa *
          </label>
          <select
            value={formData.porte}
            onChange={(e) => onChange('porte', e.target.value)}
            className={`w-full bg-[#F8FAFC] focus:bg-white border rounded-xl px-3.5 py-2.5 text-[#1E293B] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none transition-all text-sm font-medium cursor-pointer ${
              errors.porte ? 'border-red-400 bg-red-50/30' : 'border-[#E2E8F0]'
            }`}
          >
            <option value="">Selecione o porte...</option>
            {PORTES_EMPRESA.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.porte && <p className="text-xs text-red-500 mt-1 font-medium">{errors.porte}</p>}
        </div>
      </div>

      {/* Action Navigation */}
      <div className="pt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="bg-[#349885] hover:bg-[#2C8070] text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-xs uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2 group"
        >
          Próximo Passo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

