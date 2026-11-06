import React from 'react';
import { Axe, Coins, Factory, Navigation, Sprout, Store, AlertTriangle, Trophy, Gamepad2 } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-amber-300 whitespace-nowrap">{children}</kbd>
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
    how: <>срубите дерево: подойдите к нему и нажмите <Key>ПРОБЕЛ</Key> или кликните по нему ЛКМ.</>,
  },
  {
    icon: <Sprout className="w-5 h-5 text-lime-400" />,
    goal: 'Чтобы было что рубить,',
    how: <>сажайте саженцы клавишей <Key>E</Key> в лесу (+20 Br за дерево). Саженцы продаются на Рынке: <Key>E</Key> на свободном месте — 2 шт. за 20 Br.</>,
  },
];

const CONTROLS: { keys: React.ReactNode; action: string }[] = [
  { keys: <><Key>W</Key> <Key>A</Key> <Key>S</Key> <Key>D</Key> или стрелки</>, action: 'Ходить' },
  { keys: <>ЛКМ по земле</>, action: 'Шагнуть в сторону клика' },
  { keys: <>ЛКМ по объекту</>, action: 'Рубить дерево, сломать пустую коробку, открыть прилавок или доску вакансий' },
  { keys: <Key>ПРОБЕЛ</Key>, action: 'Действие рядом: рубить, пилить на лесопилке, купить со стеллажа' },
  { keys: <Key>E</Key>, action: 'В лесу — посадить саженец или открыть коробку; на Рынке — прилавок, найм, саженцы' },
  { keys: <Key>T</Key>, action: 'Телепорт Лес ⇄ Рынок (из Строймаркета — на Рынок)' },
  { keys: <Key>F</Key>, action: 'Перейти в Строймаркет; у стеллажа — купить товар' },
  { keys: <Key>M</Key>, action: 'Открыть свой прилавок' },
  { keys: <><Key>U</Key> / <Key>K</Key> / <Key>H</Key></>, action: 'Апгрейды / угодья / найм рабочих' },
  { keys: <><Key>J</Key> / <Key>B</Key></>, action: 'Журнал событий / банкротство' },
  { keys: <Key>Esc</Key>, action: 'Закрыть окно' },
];

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111d19] border border-emerald-700/60 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-emerald-900/60 bg-emerald-950/40">
          <h2 className="text-base font-bold text-white tracking-tight">🌲 Эко-Лесоруб: правила и управление</h2>
          <p className="text-xs text-emerald-300/70 mt-0.5">Пока это окно открыто, игра на паузе.</p>
        </div>

        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto text-xs text-slate-300">
          <h3 className="font-bold text-emerald-300 text-sm">Как играть</h3>
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

          <h3 className="font-bold text-emerald-300 text-sm pt-2 flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4" /> Управление
          </h3>
          <div className="rounded-lg border border-slate-800 divide-y divide-slate-800 bg-slate-900/50">
            {CONTROLS.map((c) => (
              <div key={c.action} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-3 py-1.5 items-center">
                <div className="text-slate-400">{c.keys}</div>
                <div>{c.action}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-400">Все действия также доступны кнопками на панели под игровым полем.</p>
        </div>

        <div className="px-6 py-3 border-t border-emerald-950 bg-emerald-950/20 text-center">
          <button
            onClick={onClose}
            autoFocus
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
          >
            Играть
          </button>
        </div>
      </div>
    </div>
  );
};
