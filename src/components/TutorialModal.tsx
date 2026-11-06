import React from 'react';
import { HelpCircle, TreePine, Zap, Navigation, DollarSign, AlertTriangle, X } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111d19] border border-emerald-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/40 border border-emerald-600/40">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Руководство Эко-Предпринимателя</h2>
              <p className="text-xs text-emerald-300/70">Законы гармонии леса, энергии и капитала</p>
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50">
            <h3 className="font-bold text-emerald-300 text-sm mb-1">Главная Идея Игры:</h3>
            <p className="text-slate-300 leading-relaxed">
              «Прогресс без заботы о лесе и энергии замедляет тебя самого». Если вы бездумно вырубаете лес ради сиюминутной выгоды, эко-инспекция задушит вас штрафами, а разрядившаяся батарея отключит телепорты, вынуждая вас медленно ползти пешком.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <TreePine className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">1. Рубите и Сажайте:</strong>
                Клавиша <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-amber-300">ПРОБЕЛ</kbd> — рубка дерева. Нажмите <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-emerald-300">E</kbd>, чтобы посадить саженец. Молодые побеги растут сами со временем!
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">2. Энергия и Солнечная Станция:</strong>
                Каждый шаг и удар топором расходует силы и энергию. Встаньте на площадку <strong>Солнечной Станции</strong> (слева вверху), чтобы быстро подзарядить ранец солнечным током.
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <Navigation className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">3. Квантовый Телепорт:</strong>
                Позволяет мгновенно летать между 4 зонами. Требует <strong>15 кВт·ч</strong> энергии. Если батарея разряжена — телепорты не работают!
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">4. Лесопилка и Зелёный Рынок:</strong>
                Переработайте брёвна в доски на <strong>Лесопилке</strong>, затем продайте их на <strong>Рынке</strong>. Чем гуще и здоровее ваш лес, тем выше премия и цена досок!
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">5. Эко-Инспектор и Правила Штрафов:</strong>
                Штраф начисляется <strong>только если из всех деревьев осталось всего 2 дерева</strong> (или меньше)! Проигрыш засчитывается, когда <strong>нет деревьев (0) и денег 0 Br</strong>. Сажайте саженцы [E], чтобы восстанавливать лес и получать +20 Br!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-emerald-950 bg-emerald-950/20 text-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Понятно, начать игру!
          </button>
        </div>
      </div>
    </div>
  );
};
