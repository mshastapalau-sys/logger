import React from 'react';
import { TutorialStep } from '../types/game';
import { CheckCircle2, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';

interface TutorialQuestBarProps {
  currentStep: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onOpenFullGuide: () => void;
}

export const TutorialQuestBar: React.FC<TutorialQuestBarProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  onOpenFullGuide,
}) => {
  return (
    <div className="w-full bg-[#111c18]/90 border border-emerald-800/60 rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
        <div className="p-1.5 rounded-lg bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-300">
              Обучение ({stepIndex + 1}/{totalSteps}):
            </span>
            <span className="font-semibold text-white truncate">{currentStep.title}</span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">{currentStep.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenFullGuide}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Все правила</span>
        </button>
      </div>
    </div>
  );
};
