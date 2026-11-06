import React from 'react';
import { AlertTriangle, TrendingDown, X, RotateCcw } from 'lucide-react';

interface BankruptcyModalProps {
  playerMoney: number;
  finesPaid: number;
  onConfirmBankruptcy: () => void;
  onClose: () => void;
}

export const BankruptcyModal: React.FC<BankruptcyModalProps> = ({
  playerMoney,
  finesPaid,
  onConfirmBankruptcy,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1c1214] border border-rose-600/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-900/60">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
            <TrendingDown className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>Объявление Банкротства</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3.5 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Вы хотите признать предприятие банкротом?</p>
            <p className="mt-1 text-slate-300">
              Это действие немедленно остановит текущую партию и засчитает <span className="text-rose-400 font-bold">ПОРАЖЕНИЕ</span>.
              После этого вы сможете сбросить карту и начать бизнес заново с чистого листа.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-slate-300">
          <div>
            Текущий баланс: <strong className="text-amber-400 font-mono">{playerMoney} Br</strong>
          </div>
          <div>
            Уплачено штрафов: <strong className="text-rose-400 font-mono">-{finesPaid} Br</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            Отмена (Продолжить игру)
          </button>
          <button
            onClick={onConfirmBankruptcy}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Сдаться / Банкрот</span>
          </button>
        </div>
      </div>
    </div>
  );
};
