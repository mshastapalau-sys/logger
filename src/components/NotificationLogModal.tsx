import React from 'react';
import { NotificationLogItem } from '../types/game';
import { Bell, Clock, X, Info, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface NotificationLogModalProps {
  logs: NotificationLogItem[];
  onClear: () => void;
  onClose: () => void;
}

export const NotificationLogModal: React.FC<NotificationLogModalProps> = ({
  logs,
  onClear,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121c19] border border-emerald-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-900/60 bg-[#0d1614]">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Журнал событий и надписей ({logs.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of messages */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              История событий пока пуста. Все оповещения о продажах, инспекциях и фуре будут сохраняться сюда.
            </div>
          ) : (
            logs.map((log) => {
              const borderCol =
                log.type === 'error'
                  ? 'border-rose-800/60 bg-rose-950/20 text-rose-200'
                  : log.type === 'warning'
                  ? 'border-amber-700/60 bg-amber-950/20 text-amber-200'
                  : log.type === 'success'
                  ? 'border-emerald-700/60 bg-emerald-950/20 text-emerald-200'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300';

              const Icon =
                log.type === 'error'
                  ? AlertOctagon
                  : log.type === 'warning'
                  ? AlertTriangle
                  : log.type === 'success'
                  ? CheckCircle2
                  : Info;

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border ${borderCol} flex items-start gap-3 text-xs shadow-xs`}
                >
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="leading-relaxed">{log.text}</p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-950 bg-[#0d1614] flex items-center justify-between">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Очистить журнал
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer shadow transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
