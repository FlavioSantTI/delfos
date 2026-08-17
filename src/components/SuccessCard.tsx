import React from 'react';
import { Check, RotateCcw, MessageCircle, Award, Send } from 'lucide-react';
import { SubmissionResult } from '../types';

const WHATSAPP_AGENDAR_URL =
  'https://wa.me/5563984913860?text=Quero%20agendar%20uma%20avalia%C3%A7%C3%A3o';

interface SuccessCardProps {
  result: SubmissionResult;
  onReset: () => void;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  result,
  onReset
}) => {
  const { data } = result;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden animate-fade-in p-8 sm:p-14 text-[#1E293B] text-center max-w-2xl mx-auto my-4">
      
      {/* Top Icon Badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-[#349885]/15 text-[#349885] rounded-full flex items-center justify-center mx-auto text-3xl border border-[#349885]/30 shadow-xs">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <div className="absolute top-0 right-1/2 translate-x-10 bg-[#349885] text-white p-2 rounded-full shadow-md">
          <Send className="w-4 h-4" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#349885]/10 text-[#2C8070] border border-[#349885]/20 mb-4">
        <Award className="w-3.5 h-3.5 text-[#349885]" />
        Flávio Santiago ConsultorIA
      </div>

      <h2 className="text-4xl sm:text-5xl font-light font-serif text-[#1E293B] mb-4 tracking-tight">
        Diagnóstico <span className="text-[#349885] italic font-serif">Enviado!</span>
      </h2>

      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 text-[#334155] text-base sm:text-lg leading-relaxed shadow-xs">
        Analisamos os dados da <strong className="text-[#1E293B] font-bold">{data.empresa || 'sua empresa'}</strong>. Enviamos a análise completa e o plano de ação personalizado para seu WhatsApp <span className="underline font-bold text-[#349885] whitespace-nowrap">{data.whatsapp}</span>.
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-8 py-3.5 border border-[#E2E8F0] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#F8FAFC] text-[#334155] transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-[#64748B]" />
          Novo Diagnóstico
        </button>

        <a
          href={WHATSAPP_AGENDAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 bg-[#349885] hover:bg-[#2C8070] text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Agendar avaliação
        </a>
      </div>

    </div>
  );
};


