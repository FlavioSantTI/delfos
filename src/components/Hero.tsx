import React from 'react';
import { Award, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="w-full bg-[#2A3A4A] text-white p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/60 relative overflow-hidden min-h-[380px] lg:min-h-full">
      {/* Top Section */}
      <div className="z-10 relative">
        <div className="text-[#349885] font-bold tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#349885]" />
          <span>by Flávio Santiago ConsultorIA</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight font-serif mb-2 text-white">
          <span>Delfos</span><span className="text-[#349885] italic font-serif">IA</span>
        </h1>

        <p className="text-[#A0B2C6] font-semibold text-sm sm:text-base mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#349885] shrink-0" />
          Diagnóstico, predição e acompanhamento de maturidade
        </p>
        
        <p className="text-[#A0B2C6] text-sm sm:text-base leading-relaxed max-w-md">
          Descubra o estágio tecnológico da sua empresa e receba um plano de ação personalizado em menos de 5 minutos.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap gap-2.5 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/20 text-[#E2E8F0] font-medium backdrop-blur-xs">
            <span>⏱️</span> Em menos de 5 minutos
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/20 text-[#E2E8F0] font-medium backdrop-blur-xs">
            <span>📲</span> Envio no WhatsApp & E-mail
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/20 text-[#E2E8F0] font-medium backdrop-blur-xs">
            <span>🆓</span> 100% Gratuito
          </span>
        </div>
      </div>

      {/* Bottom Market Context Section - Card 85% Golden Beige */}
      <div className="z-10 relative mt-10 lg:mt-12 pt-6 border-t border-slate-700/60">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl border border-[#D1A05A]/40 bg-[#D1A05A]/15 flex items-center justify-center text-xl lg:text-2xl font-serif italic text-[#E2C08D] shrink-0 shadow-inner">
            85%
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
              85% das empresas buscam automação com IA este ano.
            </h4>
            <p className="text-xs sm:text-sm text-[#A0B2C6] mt-2 leading-relaxed">
              Pesquisas de mercado (Gartner, McKinsey e IBM) mostram que a prioridade global mudou: o foco agora é integrar agentes autônomos e otimizar processos em escala. Não fique para trás.
            </p>
          </div>
        </div>

        {/* Background Decorative Watermark */}
        <div className="text-[120px] lg:text-[140px] font-serif italic text-white/5 absolute -bottom-12 -left-6 pointer-events-none select-none z-0">
          IA
        </div>
      </div>
    </div>
  );
};
