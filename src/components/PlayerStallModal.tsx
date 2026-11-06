import React from 'react';
import { MarketStallStock, PlayerStats } from '../types/game';
import { Store, Plus, ArrowUpRight, DollarSign, X } from 'lucide-react';

interface PlayerStallModalProps {
  stock: MarketStallStock;
  player: PlayerStats;
  onAddPlanksToDisplay: (count: number) => void;
  onAddLogsToDisplay: (count: number) => void;
  onClose: () => void;
}

export const PlayerStallModal: React.FC<PlayerStallModalProps> = ({
  stock,
  player,
  onAddPlanksToDisplay,
  onAddLogsToDisplay,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121c19] border border-emerald-700/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/40 border border-emerald-600/40 text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Ваш Торговый Прилавок
              </h2>
              <p className="text-xs text-emerald-300/70">
                Разложите древесину на витрине — покупатели берут по 1-2 шт.
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

        <div className="p-6 space-y-4 text-xs text-slate-300">
          {/* Display Planks */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Доски на витрине:</span>
                <p className="text-[11px] text-slate-400">
                  Цена продажи: <strong className="text-emerald-400 font-mono">{stock.pricePerPlank} Br</strong> за штуку
                </p>
              </div>
              <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                {stock.planksOnDisplay} шт.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onAddPlanksToDisplay(Math.min(player.planks, 5))}
                disabled={player.planks === 0}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  player.planks > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                + Выложить 5 досок (в ранце: {player.planks})
              </button>
              <button
                onClick={() => onAddPlanksToDisplay(player.planks)}
                disabled={player.planks === 0}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  player.planks > 0
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Все
              </button>
            </div>
          </div>

          {/* Display Logs */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Брёвна на витрине:</span>
                <p className="text-[11px] text-slate-400">
                  Цена продажи: <strong className="text-amber-400 font-mono">{stock.pricePerLog} Br</strong> за штуку
                </p>
              </div>
              <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                {stock.logsOnDisplay} шт.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onAddLogsToDisplay(Math.min(player.logs, 3))}
                disabled={player.logs === 0}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  player.logs > 0
                    ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95 shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                + Выложить 3 бревна (в ранце: {player.logs})
              </button>
              <button
                onClick={() => onAddLogsToDisplay(player.logs)}
                disabled={player.logs === 0}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  player.logs > 0
                    ? 'bg-amber-700 hover:bg-amber-600 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Все
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-[11px] text-slate-300">
            Горожане подходят к вашему прилавку и покупают по 1-2 штуки. Вы можете свободно гулять по рынку, пока идёт торговля!
          </div>
        </div>

        <div className="px-6 py-3 border-t border-emerald-950 bg-emerald-950/20 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Закрыть прилавок [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
