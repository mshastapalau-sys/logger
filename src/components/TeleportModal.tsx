import React from 'react';
import { TeleportPad } from '../types/game';
import { Navigation, Zap, AlertTriangle, X, ArrowUpRight } from 'lucide-react';

interface TeleportModalProps {
  energy: number;
  teleportEnergyCost: number;
  teleports: TeleportPad[];
  onClose: () => void;
  onTeleportTo: (pad: TeleportPad) => void;
}

export const TeleportModal: React.FC<TeleportModalProps> = ({
  energy,
  teleportEnergyCost,
  teleports,
  onClose,
  onTeleportTo,
}) => {
  const isOnline = energy >= teleportEnergyCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121c19] border border-cyan-800/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-900/60 flex items-center justify-between bg-cyan-950/30">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${isOnline ? 'bg-cyan-900/40 border-cyan-600/40' : 'bg-rose-950/40 border-rose-600/40'}`}>
              <Navigation className={`w-5 h-5 ${isOnline ? 'text-cyan-400' : 'text-rose-400'}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Квантовая Сеть Телепортов</h2>
              <p className="text-xs text-cyan-300/70">
                {isOnline ? 'Мгновенное перемещение по угодьям' : 'СИСТЕМА ОТКЛЮЧЕНА (РАЗРЯДКА)'}
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
          {/* Energy Status */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isOnline ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-200' : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Стоимость прыжка: <strong>{teleportEnergyCost} кВт·ч</strong></span>
            </div>
            <div>
              <span>Запас: <strong className="font-mono">{Math.round(energy)} кВт·ч</strong></span>
            </div>
          </div>

          {!isOnline && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-700/60 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>
                <strong>Внимание!</strong> При нехватке энергии телепорт выключается. Вам придётся идти пешком к Солнечной Станции, теряя драгоценное время перед проверкой инспектора!
              </p>
            </div>
          )}

          {/* Teleport Destinations Grid */}
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {teleports.map((pad, idx) => (
              <button
                key={pad.id}
                onClick={() => {
                  if (isOnline) {
                    onTeleportTo(pad);
                    onClose();
                  }
                }}
                disabled={!isOnline}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isOnline
                    ? 'bg-[#182622] hover:bg-cyan-950/50 border-slate-800 hover:border-cyan-600/50 active:scale-98 cursor-pointer'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      [{idx + 1}]
                    </span>
                    <span className="text-sm font-semibold text-white">{pad.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 pl-6">{pad.description}</p>
                </div>

                <div className="shrink-0 p-1.5 rounded-lg bg-slate-800/80 text-cyan-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-950 bg-cyan-950/20 text-center">
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
