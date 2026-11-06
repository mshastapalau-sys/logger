import React from 'react';
import { PlayerStats } from '../types/game';
import { Trophy, AlertOctagon, RotateCcw, TreePine, DollarSign, TrendingDown } from 'lucide-react';

interface EndGameModalProps {
  player: PlayerStats;
  forestHealth: number;
  onRestart: () => void;
  reason?: 'BANKRUPTCY' | 'STRIKES' | 'FINES' | string;
}

export const VictoryModal: React.FC<EndGameModalProps> = ({ player, forestHealth, onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#10221c] border border-emerald-500 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-center p-6 space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">🏆 Великая Эко-Победа!</h2>
          <p className="text-xs text-emerald-300/80 mt-1">
            Вы выполнили главную цель: посадили 1,000 саженцев и заработали свыше 100,000 Br на чистом производстве!
          </p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-900/60 p-3.5 rounded-xl border border-emerald-900/50">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <TreePine className="w-4 h-4 shrink-0" />
            <span>Лес: <strong>{Math.round(forestHealth)}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Капитал: <strong>{player.money.toLocaleString()} Br</strong></span>
          </div>
          <div className="text-emerald-400 font-medium">
            Посажено саженцев: <strong className="text-white font-bold">{player.treesPlanted} / 1000</strong> ✓
          </div>
          <div className="text-slate-400">
            Срублено стволов: <strong className="text-white">{player.treesChopped}</strong>
          </div>
          <div className="text-emerald-400 col-span-2 text-center py-1 bg-emerald-950/40 rounded-lg border border-emerald-800/40">
            🌳 За каждое посаженное дерево получено: <strong>+20 Br</strong> (субсидии убраны)
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Сбросить карту и начать новую партию</span>
        </button>
        <p className="text-[10px] text-slate-400">
          Сбрасывает сетку из 9 квадратов, генерирует свежий лес и очищает склады
        </p>
      </div>
    </div>
  );
};

export const GameOverModal: React.FC<EndGameModalProps> = ({ player, forestHealth: _forestHealth, onRestart, reason }) => {
  const isBankruptcy = reason === 'BANKRUPTCY';
  const isNoTrees = reason === 'NO_TREES_NO_MONEY';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1f1414] border border-rose-600/70 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-center p-6 space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          {isBankruptcy ? <TrendingDown className="w-8 h-8" /> : <AlertOctagon className="w-8 h-8" />}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isBankruptcy
              ? 'Объявлено Банкротство!'
              : isNoTrees
              ? '🌲 Нет деревьев и 0 Br денег — Проигрыш!'
              : 'Экологическая Катастрофа!'}
          </h2>
          <p className="text-xs text-rose-300/80 mt-1">
            {isBankruptcy
              ? 'Вы признали эко-предприятие финансово несостоятельным. Производство остановлено, долговые обязательства закрыты.'
              : isNoTrees
              ? 'В лесу не осталось ни одного дерева (0 деревьев) и у вас 0 Br денег. Восстановить производство невозможно!'
              : 'В лесу не осталось ресурсов для продолжения работы.'}
          </p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-900/60 p-3.5 rounded-xl border border-rose-900/50">
          <div className="flex items-center gap-1.5 text-rose-300">
            <TreePine className="w-4 h-4 shrink-0" />
            <span>Деревьев в лесу: <strong>0 шт.</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Баланс: <strong>{player.money} Br</strong></span>
          </div>
          <div className="text-slate-400">
            Срублено стволов: <strong className="text-white">{player.treesChopped}</strong>
          </div>
          <div className="text-slate-400">
            Посажено саженцев: <strong className="text-white">{player.treesPlanted}</strong>
          </div>
          <div className="text-rose-400 col-span-2">
            Выплачено штрафов: <strong className="font-mono">-{player.finesPaid} Br</strong>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          {isBankruptcy
            ? 'Совет: на старте не заказывайте дорогое оборудование, продавайте доски на рынке и сажайте саженцы за 20 Br!'
            : 'Правило игры: штраф даётся только если осталось 2 дерева! Проигрыш засчитывается, когда нету деревьев и денег 0 Br.'}
        </p>

        <button
          onClick={onRestart}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Сбросить карту и начать заново</span>
        </button>
        <p className="text-[10px] text-slate-400">
          Сбрасывает сетку из 9 квадратов, восстанавливает лес и даёт стартовые 140 Br
        </p>
      </div>
    </div>
  );
};
