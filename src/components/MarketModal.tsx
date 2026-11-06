import React from 'react';
import { PlayerStats } from '../types/game';
import { ShoppingBag, ArrowRight, TreePine, Sparkles, X, TrendingUp } from 'lucide-react';

interface MarketModalProps {
  player: PlayerStats;
  forestHealth: number;
  onClose: () => void;
  onSellPlanks: (count: number) => void;
  onProcessLogs: () => void;
  onBuySaplings: (count: number) => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({
  player,
  forestHealth,
  onClose,
  onSellPlanks,
  onProcessLogs,
  onBuySaplings,
}) => {
  // Dynamic price multiplier based on forest health:
  // 100% forest health = 1.6x price bonus!
  // <45% forest health = 0.8x price penalty!
  const multiplier = Math.max(0.7, 0.9 + (forestHealth / 100) * 0.7);
  const basePlankPrice = 16;
  const currentPlankPrice = Math.round(basePlankPrice * multiplier);
  const saplingCost2 = 20;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121e1a] border border-emerald-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/40 border border-emerald-600/40">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Городской Зелёный Рынок</h2>
              <p className="text-xs text-emerald-300/70">Экологичная торговля лесоматериалами и саженцами</p>
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
        <div className="p-6 space-y-5">
          {/* Forest Health & Reputation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-300 font-medium">Рыночная Эко-Репутация:</div>
                <div className="text-[11px] text-slate-400">
                  {forestHealth >= 70
                    ? 'Высокая забота о лесе! Покупатели платят повышенную надбавку.'
                    : forestHealth >= 45
                    ? 'Стандартная ставка. Сажайте деревья для роста прибыли.'
                    : 'Внимание: истощение леса снижает закупочную цену!'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold text-sm">
                x{multiplier.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">Множитель цен</div>
            </div>
          </div>

          {/* Section 1: Sell Planks */}
          <div className="p-4 rounded-xl bg-[#162722] border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-emerald-200">Продажа досок горожанам</h3>
                <p className="text-xs text-emerald-300/70">
                  Горожане покупают по <strong className="text-emerald-400">${currentPlankPrice}</strong> за 1 доску
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">В наличии: </span>
                <span className="text-sm font-bold text-emerald-300">{player.planks} шт.</span>
              </div>
            </div>

            <button
              onClick={() => onSellPlanks(player.planks)}
              disabled={player.planks === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                player.planks > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Продать {player.planks} досок горожанам за +${player.planks * currentPlankPrice}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Section 2: Buy Saplings */}
          <div className="p-4 rounded-xl bg-[#162722] border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-emerald-200">Эко-Саженцы для восстановления леса</h3>
                <p className="text-xs text-emerald-300/70">Упаковка: 2 отборных саженца сосны и дуба</p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-sm">${saplingCost2}</span>
                <span className="text-[10px] text-slate-400 block">за 2 шт.</span>
              </div>
            </div>

            <button
              onClick={() => onBuySaplings(2)}
              disabled={player.money < saplingCost2}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                player.money >= saplingCost2
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md active:scale-98 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Купить 2 саженца (-$20)</span>
            </button>
          </div>

          {/* Section 3: Sawmill note */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Распил брёвен в доски производится на <strong>Лесопилке в Лесу</strong>.</span>
            <span className="text-amber-400 font-mono">Брёвен: {player.logs}</span>
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
