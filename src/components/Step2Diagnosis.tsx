import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, X, Check } from 'lucide-react';
import { FormData } from '../types';
import { ESTAGIOS_IA, AREAS_APLICACAO, FERRAMENTAS_SUGERIDAS } from '../data/stages';

interface Step2Props {
  formData: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

export const Step2Diagnosis: React.FC<Step2Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  errors
}) => {
  const [toolInput, setToolInput] = useState('');

  const handleAddTool = (toolName: string) => {
    const trimmed = toolName.trim();
    if (!trimmed) return;
    if (!formData.ferramentas.includes(trimmed)) {
      onChange('ferramentas', [...formData.ferramentas, trimmed]);
    }
    setToolInput('');
  };

  const handleRemoveTool = (toolName: string) => {
    onChange('ferramentas', formData.ferramentas.filter((t) => t !== toolName));
  };

  const handleToolKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTool(toolInput);
    }
  };

  const handleToggleArea = (areaLabel: string) => {
    if (areaLabel === 'Nenhuma área por enquanto') {
      onChange('areas', ['Nenhuma área por enquanto']);
      return;
    }

    const currentAreas = formData.areas.filter((a) => a !== 'Nenhuma área por enquanto');
    if (currentAreas.includes(areaLabel)) {
      onChange('areas', currentAreas.filter((a) => a !== areaLabel));
    } else {
      onChange('areas', [...currentAreas, areaLabel]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-3xl sm:text-4xl font-light font-serif text-[#1E293B] mb-2">
          Estágio de <span className="text-[#349885] italic font-serif">Uso</span>
        </h2>
        <p className="text-[#64748B] text-sm">
          Selecione o nível que melhor descreve a realidade atual da sua empresa.
        </p>
      </div>

      {/* Estágios de Uso (Radio Cards) */}
      <div>
        <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-3">
          Estágio Atual de Adoção de IA *
        </label>
        {errors.estagio && <p className="text-xs text-red-500 mb-2 font-medium">{errors.estagio}</p>}

        <div className="grid grid-cols-1 gap-3.5">
          {ESTAGIOS_IA.map((stage) => {
            const isSelected = formData.estagio === stage.titulo;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  onChange('estagio', stage.titulo);
                  onChange('estagioNivel', stage.nivel);
                }}
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-[#349885] bg-[#349885]/10 shadow-2xs'
                    : 'border-[#E2E8F0] hover:border-[#349885]/50 bg-[#F8FAFC] hover:bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 mt-0.5 transition ${
                    isSelected ? 'bg-[#349885] text-white' : 'bg-white text-[#334155] border border-[#E2E8F0]'
                  }`}
                >
                  {stage.nivel}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm sm:text-base text-[#1E293B]">
                      {stage.titulo}
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-[#349885]/20 text-[#2C8070] border-[#349885]/30'
                          : 'bg-white text-[#64748B] border-[#E2E8F0]'
                      }`}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#334155] mb-1">
                    {stage.subtitulo}
                  </p>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {stage.descricao}
                  </p>
                </div>

                {/* Radio Circle Check */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition ${
                    isSelected
                      ? 'border-[#349885] bg-[#349885] text-white'
                      : 'border-[#94A3B8] bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ferramentas de IA Utilizadas (Tag Input) */}
      <div className="pt-2">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-1">
          Ferramentas de IA Utilizadas ou Testadas
        </label>
        <p className="text-xs text-[#64748B] mb-2">
          Pressione Enter para adicionar ferramentas personalizadas.
        </p>

        {/* Input & Add Button */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={handleToolKeyDown}
            placeholder="Ex: ChatGPT, Claude, n8n, Midjourney, Make..."
            className="flex-1 bg-[#F8FAFC] focus:bg-white border border-[#E2E8F0] focus:border-[#349885] focus:ring-1 focus:ring-[#349885]/20 outline-none px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1E293B] placeholder-[#94A3B8] transition-all"
          />
          <button
            type="button"
            onClick={() => handleAddTool(toolInput)}
            className="bg-[#1E293B] hover:bg-[#0F172A] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>

        {/* Selected Tools Tags */}
        {formData.ferramentas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.ferramentas.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#349885]/15 text-[#2C8070] border border-[#349885]/30"
              >
                {tool}
                <button
                  type="button"
                  onClick={() => handleRemoveTool(tool)}
                  className="hover:text-red-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick Suggestions Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#64748B] mr-1">
            Sugestões Rápidas:
          </span>
          {FERRAMENTAS_SUGERIDAS.map((sug) => {
            const isAdded = formData.ferramentas.includes(sug);
            return (
              <button
                key={sug}
                type="button"
                onClick={() => (isAdded ? handleRemoveTool(sug) : handleAddTool(sug))}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition ${
                  isAdded
                    ? 'bg-[#349885] text-white border-[#349885] font-bold'
                    : 'bg-[#F8FAFC] hover:bg-white text-[#334155] border-[#E2E8F0]'
                }`}
              >
                {isAdded ? `✓ ${sug}` : `+ ${sug}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Áreas de Aplicação */}
      <div className="pt-2">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#334155] block mb-3">
          Áreas de Aplicação da IA na Empresa
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AREAS_APLICACAO.map((area) => {
            const isChecked = formData.areas.includes(area.label);

            return (
              <label
                key={area.id}
                onClick={() => handleToggleArea(area.label)}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                  isChecked
                    ? 'border-[#349885] bg-[#349885]/10 text-[#1E293B] font-bold'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-[#F8FAFC] text-[#334155] font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm">{area.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="rounded border-[#E2E8F0] text-[#349885] focus:ring-[#349885] w-4 h-4"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-[#64748B] hover:text-[#1E293B] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

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

