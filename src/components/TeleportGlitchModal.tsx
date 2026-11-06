import React from 'react';
import { ZapOff, Clock, DollarSign, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface TeleportGlitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  solarPanelsCount: number;
  failureChance: number;
  rebootTimer: number; // remaining seconds (0 if not waiting yet)
  onPay100: () => void;
  onWait1Min: () => void;
}

export const TeleportGlitchModal: React.FC<TeleportGlitchModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  solarPanelsCount,
  failureChance,
  rebootTimer,
  onPay100,
  onWait1Min,
}) => {
  if (!isOpen) return null;

  const canAfford = playerMoney >= 100;
  const isCountingDown = rebootTimer > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1a1215] border-2 border-rose-500/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950/90 via-red-900/60 to-rose-950/90 px-6 py-4 border-b border-rose-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <ZapOff className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ⚠️ Аварийное Отключение Телепорта!
            </h2>
            <p className="text-xs text-rose-300/80">
              Сбой питания сети. Телепорт обесточен и временно не функционирует.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Chance breakdown explanation */}
          <div className="bg-slate-900/70 border border-rose-950/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Механика риска сбоя телепорта:
              </span>
              <span className="font-mono text-rose-400 font-bold">{failureChance}%</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              В начале игры шанс отключения равен <strong className="text-rose-300">25%</strong>.
              Каждая купленная и установленная солнечная панель снижает риск на <strong className="text-cyan-300">5%</strong>!
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-cyan-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>Солнечных панелей: <strong>{solarPanelsCount} шт.</strong></span>
              </div>
              <div className="bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Снижение риска: <strong>-{solarPanelsCount * 5}%</strong></span>
              </div>
            </div>
          </div>

          {/* Active Timer status if waiting */}
          {isCountingDown && (
            <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl text-center space-y-2 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                <span>Идёт аварийная перезагрузка системы...</span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                {rebootTimer} сек.
              </div>
              <p className="text-[11px] text-amber-200/70">
                Телепорт включится автоматически после завершения отсчета. Либо вы можете оплатить 100 Br прямо сейчас!
              </p>
            </div>
          )}

          {/* Player choice buttons */}
          <div className="space-y-2 pt-1">
            <div className="text-slate-300 font-medium">Выберите способ восстановления:</div>

            {/* Option 1: Pay 100 */}
            <button
              onClick={onPay100}
              disabled={!canAfford}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                canAfford
                  ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/60 text-white cursor-pointer active:scale-98 shadow-md hover:border-emerald-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${canAfford ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>Заплатить 100 Br</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Мгновенный запуск
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Экспресс-ремонт: немедленно запустить и активировать телепорт
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-sm ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                  100 Br
                </span>
                {!canAfford && <div className="text-[10px] text-rose-400">Не хватает {100 - playerMoney} Br</div>}
              </div>
            </button>

            {/* Option 2: Wait 1 minute */}
            <button
              onClick={onWait1Min}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer active:scale-98 ${
                isCountingDown
                  ? 'bg-amber-950/30 border-amber-600/50 text-amber-200'
                  : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>{isCountingDown ? `Идёт ожидание (${rebootTimer}с)` : 'Ждать 1 минуту (60 сек)'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Бесплатно
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Автоматический перезапуск конденсоров телепорта без траты монет
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-slate-400">
                0 Br
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Ваш баланс: <strong className="text-amber-400 font-mono">{playerMoney} Br</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            {isCountingDown ? 'Свернуть окно (отсчет продолжается)' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
};
