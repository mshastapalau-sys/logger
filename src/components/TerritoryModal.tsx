import React from 'react';
import { TerritoryPlot } from '../types/game';
import { Grid, Lock, Check, DollarSign, X, MapPin } from 'lucide-react';

interface TerritoryModalProps {
  plots: TerritoryPlot[];
  playerMoney: number;
  onBuyPlot: (plot: TerritoryPlot) => void;
  onClose: () => void;
}

export const TerritoryModal: React.FC<TerritoryModalProps> = ({
  plots,
  playerMoney,
  onBuyPlot,
  onClose,
}) => {
  const unlockedCount = plots.filter((p) => p.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121c19] border border-emerald-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/40 border border-emerald-600/40">
              <Grid className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Расширение Земельных Угодий
              </h2>
              <p className="text-xs text-emerald-300/70">
                Всего 9 квадратов территории · Открыто: {unlockedCount}/9
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Каждый новый купленный квадрат за <strong>1000 Br</strong> расширяет ваши лесные угодья, добавляет новые сосновые рощи, древние дубы и место под установку солнечных панелей и ветряков!
          </p>

          {/* 3x3 Grid Display */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            {plots.map((plot) => {
              const canAfford = playerMoney >= plot.cost;
              return (
                <div
                  key={plot.id}
                  className={`aspect-square rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all border ${
                    plot.unlocked
                      ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300 shadow-sm'
                      : 'bg-[#15201c] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-500">
                    Сектор [{plot.row + 1},{plot.col + 1}]
                  </div>

                  {plot.unlocked ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-300">Освоен</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="w-5 h-5 text-slate-500" />
                      <span className="text-xs font-bold text-amber-400">{plot.cost} Br</span>
                    </div>
                  )}

                  {!plot.unlocked && (
                    <button
                      onClick={() => onBuyPlot(plot)}
                      disabled={!canAfford}
                      className={`w-full py-1 rounded text-[10px] font-bold transition-all ${
                        canAfford
                          ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Купить
                    </button>
                  )}
                  {plot.unlocked && <div className="h-4" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Ваш баланс:</span>
            <span className="font-bold text-amber-400">{playerMoney} Br</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-emerald-950 bg-emerald-950/20 text-center">
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
