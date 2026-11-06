import React from 'react';
import { Worker } from '../types/game';
import { Users, FileText, DollarSign, X, Check, AlertCircle } from 'lucide-react';

interface WorkerHireModalProps {
  workers: Worker[];
  playerMoney: number;
  onPostJobFlyer: () => void;
  onPayWages: () => void;
  onClose: () => void;
}

export const WorkerHireModal: React.FC<WorkerHireModalProps> = ({
  workers,
  playerMoney,
  onPostJobFlyer,
  onPayWages,
  onClose,
}) => {
  const flyerCost = 25;
  const totalWageDue = workers.length * 30; // 30 монет зарплата каждому

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121c19] border border-amber-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-900/60 flex items-center justify-between bg-amber-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-800/40 border border-amber-600/40 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Доска Объявлений: Наём Помощников
              </h2>
              <p className="text-xs text-amber-300/70">
                Расклейка объявлений и выплата зарплаты (30 монет)
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
        <div className="p-6 space-y-4 text-xs text-slate-300">
          {/* Post Flyers Card */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-900/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Расклеить объявления по городу
                </h3>
                <p className="text-slate-400 mt-1">
                  Расклейка листовок в городе привлечет нового помощника-лесоруба на ваши участки.
                </p>
              </div>
              <div className="text-right font-bold text-amber-400 text-sm">
                {flyerCost} Br
              </div>
            </div>

            <button
              onClick={onPostJobFlyer}
              disabled={playerMoney < flyerCost}
              className={`w-full py-2 px-3 rounded-lg font-semibold transition-all ${
                playerMoney >= flyerCost
                  ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-98 shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Расклеить бумажки и нанять рабочего (-{flyerCost} Br)
            </button>
          </div>

          {/* Hired Workers List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Нанятые помощники ({workers.length}):</span>
              <span className="text-slate-400">З/П: 30 Br за смену</span>
            </div>

            {workers.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-500">
                Пока нет нанятых рабочих. Расклейте объявления выше!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="p-2.5 rounded-lg bg-[#162722] border border-emerald-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-800/60 flex items-center justify-center font-bold text-emerald-300 text-xs">
                        {worker.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{worker.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Автоматически сажает деревья и помогает в лесу
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-bold">30 Br</span>
                      <span className="text-[10px] text-slate-400 block">ставка</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wage payment button */}
          {workers.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between">
              <div>
                <div className="font-semibold text-emerald-300">
                  Общая зарплата: {totalWageDue} Br
                </div>
                <div className="text-[10px] text-slate-400">
                  Регулярно выплачивайте зарплату 30 Br, чтобы рабочие трудились с усердием!
                </div>
              </div>
              <button
                onClick={onPayWages}
                disabled={playerMoney < totalWageDue}
                className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
                  playerMoney >= totalWageDue
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Выплатить з/п (-{totalWageDue} Br)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-950 bg-amber-950/20 text-center">
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
