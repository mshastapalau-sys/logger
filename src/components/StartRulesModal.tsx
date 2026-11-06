import React from 'react';
import { Axe, Coins, Factory, Navigation, Sprout, Store, AlertTriangle, Trophy } from 'lucide-react';

interface StartRulesModalProps {
  onClose: () => void;
}

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-amber-300">{children}</kbd>
);

const RULES: { icon: React.ReactNode; goal: string; how: React.ReactNode }[] = [
  {
    icon: <Coins className="w-5 h-5 text-amber-400" />,
    goal: 'Чтобы заработать деньги,',
    how: <>нужно продать древесину на своём прилавке на Рынке. Покупатели приходят, пока вы на Рынке. Доски дороже брёвен.</>,
  },
  {
    icon: <Store className="w-5 h-5 text-emerald-300" />,
    goal: 'Чтобы продать древесину,',
    how: <>её нужно выложить на прилавок: подойдите к нему, нажмите <Key>E</Key> и выложите доски или брёвна.</>,
  },
  {
    icon: <Navigation className="w-5 h-5 text-cyan-300" />,
    goal: 'Чтобы попасть на Рынок,',
    how: <>нажмите <Key>T</Key> — телепорт. Иногда он ломается: ремонт 100 Br или ожидание 60 секунд.</>,
  },
  {
    icon: <Factory className="w-5 h-5 text-orange-300" />,
    goal: 'Чтобы получить доски,',
    how: <>распилите брёвна на лесопилке: встаньте у неё и нажмите <Key>ПРОБЕЛ</Key>. Из 1 бревна выходит 2 доски.</>,
  },
  {
    icon: <Axe className="w-5 h-5 text-amber-300" />,
    goal: 'Чтобы получить брёвна,',
    how: <>срубите дерево: подойдите к нему и нажмите <Key>ПРОБЕЛ</Key> или ЛКМ.</>,
  },
  {
    icon: <Sprout className="w-5 h-5 text-lime-400" />,
    goal: 'Чтобы было что рубить,',
    how: <>сажайте саженцы клавишей <Key>E</Key> в лесу (+20 Br за дерево). Саженцы продаются на Рынке.</>,
  },
];

export const StartRulesModal: React.FC<StartRulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111d19] border border-emerald-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-emerald-900/60 bg-emerald-950/40">
          <h2 className="text-base font-bold text-white tracking-tight">🌲 Эко-Лесоруб: краткие правила</h2>
          <p className="text-xs text-emerald-300/70 mt-0.5">
            Ходите клавишами <Key>W</Key> <Key>A</Key> <Key>S</Key> <Key>D</Key>
          </p>
        </div>

        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto text-xs text-slate-300">
          {RULES.map((rule) => (
            <div key={rule.goal} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="shrink-0 mt-0.5">{rule.icon}</div>
              <p className="leading-relaxed">
                <strong className="text-white">{rule.goal}</strong> {rule.how}
              </p>
            </div>
          ))}

          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Берегите лес:</strong> если в нём останется 2 дерева или меньше, эко-инспектор выпишет штраф 100 Br. Нет деревьев, саженцев и денег — игра проиграна.
            </p>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700/50">
            <Trophy className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Победа:</strong> посадите 1000 деревьев и накопите 100 000 Br.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-emerald-950 bg-emerald-950/20 text-center">
          <button
            onClick={onClose}
            autoFocus
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
          >
            Начать игру
          </button>
        </div>
      </div>
    </div>
  );
};
