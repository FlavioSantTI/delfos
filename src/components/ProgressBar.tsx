import React from 'react';
import { User, Cpu, Target, Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  const stepsInfo = [
    { number: 1, title: 'Perfil Comercial', icon: User },
    { number: 2, title: 'Estágio de IA', icon: Cpu },
    { number: 3, title: 'Objetivos Finais', icon: Target }
  ];

  return (
    <div className="w-full">
      {/* Top Bar Indicator line */}
      <div className="h-2 bg-[#E2E8F0] w-full overflow-hidden">
        <div
          className="h-full bg-[#349885] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators Header */}
      <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-8 w-full justify-between sm:justify-start">
          {stepsInfo.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-[#349885] text-white font-bold'
                      : isActive
                      ? 'bg-[#349885] text-white font-bold shadow-xs'
                      : 'bg-[#E2E8F0] text-[#94A3B8] font-medium'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                </div>
                <span
                  className={`text-[11px] uppercase tracking-wider font-bold ${
                    isActive
                      ? 'text-[#1E293B]'
                      : isCompleted
                      ? 'text-[#334155]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

