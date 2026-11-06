import React from 'react';
import { CompetitorStall } from '../types/game';
import { Store, TrendingUp, X, CheckCircle2 } from 'lucide-react';

interface CompetitorModalProps {
  stall: CompetitorStall;
  onClose: () => void;
}

export const CompetitorModal: React.FC<CompetitorModalProps> = ({ stall, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121c19] border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">{stall.ownerName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ассортимент конкурента:</span>
              <span className="font-semibold text-amber-300">{stall.woodType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Цена за 1 шт:</span>
              <span className="font-mono font-bold text-white">{stall.pricePerUnit} Br</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Остаток на складе:</span>
              <span className="text-slate-200">{stall.stockCount} шт.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-200 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              У этого конкурента только одно сырое дерево без эко-сертификата! Ваши экологичные сухие доски ценятся горожанами выше и раскупаются в первую очередь.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Закрыть [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
