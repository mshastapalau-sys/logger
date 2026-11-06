import React from 'react';
import { AlertTriangle, Zap, DollarSign, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CityFineModalProps {
  fineAmount: number;
  remainingSeconds: number;
  playerMoney: number;
  onPayFine: () => void;
  onRefuseToPay: () => void;
  onClose: () => void;
  isRefused: boolean;
}

export const CityFineModal: React.FC<CityFineModalProps> = ({
  fineAmount,
  remainingSeconds,
  playerMoney,
  onPayFine,
  onRefuseToPay,
  onClose,
  isRefused,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const canAfford = playerMoney >= fineAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#181313] border border-amber-600/70 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-900/60 flex items-center gap-3 bg-amber-950/40">
          <div className="p-2 rounded-lg bg-amber-900/50 border border-amber-600 text-amber-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Городской Энергонадзор
            </h2>
            <p className="text-xs text-amber-300/80">
              Счёт за перегрузку городской электросети
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/50 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Вы потребили критический объём городской энергии через телепорты и зарядные узлы. Муниципальная сеть обесточена для защиты от аварии!
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400">Сумма штрафа:</div>
            <div className="text-amber-400 font-bold text-base tabular-nums flex items-center gap-1">
              <span>{fineAmount} Br</span>
            </div>
          </div>

          {isRefused && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-700/60 text-rose-200 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400 animate-spin" />
                  Штрафная блокировка сети:
                </span>
                <span className="font-mono text-sm text-rose-300 tabular-nums">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                Телепорт и зарядка отключены на 5 минут. Вы можете оплатить штраф прямо сейчас для моментальной разблокировки!
              </p>
            </div>
          )}

          {/* Action Choice Buttons */}
          <div className="space-y-2 pt-2">
            {/* Choice 1: Pay now */}
            <button
              onClick={onPayFine}
              disabled={!canAfford}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                canAfford
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-98 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Оплатить {fineAmount} Br — ВКЛЮЧИТЬ ТЕЛЕПОРТ МОМЕНТАЛЬНО
              </span>
            </button>

            {/* Choice 2: Refuse / Wait 5 minutes */}
            {!isRefused ? (
              <button
                onClick={onRefuseToPay}
                className="w-full py-2 px-4 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Не платить (отключение телепорта на 5 минут)</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Закрыть окно (ждать окончания таймера)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
