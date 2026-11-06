import React from 'react';
import { PlayerStats, InspectorState, DayNightCycle, CityGridPenalty } from '../types/game';
import {
  DollarSign,
  TreePine,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  ShoppingBag,
  Wrench,
  Navigation,
  Sun,
  Moon,
  AlertTriangle,
  TrendingDown,
  Bell,
  ZapOff,
  Trophy,
} from 'lucide-react';

interface HUDProps {
  player: PlayerStats;
  forestHealth: number;
  inspector: InspectorState;
  dayNight: DayNightCycle;
  gridPenalty: CityGridPenalty;
  isMuted: boolean;
  // Teleport breakdown props
  isTeleportBroken: boolean;
  teleportRebootTimer: number;
  teleportFailureChance: number;
  solarPanelsCount: number;
  onOpenTeleportGlitch: () => void;
  onPay100Teleport: () => void;
  // Actions
  onOpenUpgrades: () => void;
  onToggleMute: () => void;
  onOpenMarket: () => void;
  onOpenStore: () => void;
  onOpenTeleport: () => void;
  onOpenGuide: () => void;
  onOpenGridPenalty: () => void;
  onInteractAction: () => void;
  onPlantAction: () => void;
  onOpenBankruptcy: () => void;
  onOpenNotificationLog: () => void;
  notificationCount?: number;
  livingTreesCount?: number;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  forestHealth,
  inspector,
  dayNight,
  gridPenalty,
  isMuted,
  isTeleportBroken,
  teleportRebootTimer,
  teleportFailureChance,
  solarPanelsCount,
  onOpenTeleportGlitch,
  onPay100Teleport,
  onOpenUpgrades,
  onToggleMute,
  onOpenMarket,
  onOpenStore,
  onOpenTeleport,
  onOpenGuide,
  onOpenGridPenalty,
  onInteractAction,
  onPlantAction,
  onOpenBankruptcy,
  onOpenNotificationLog,
  notificationCount = 0,
  livingTreesCount,
}) => {
  const isTeleportOnline = !isTeleportBroken && !gridPenalty.hasPenalty;

  const getForestHealthColor = () => {
    if (forestHealth >= 70) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (forestHealth >= 45) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40 animate-pulse';
  };

  const formatHours = (h: number) => {
    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  const formatPenaltyTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* City Power Grid Penalty Alert Bar */}
      {gridPenalty.hasPenalty && (
        <div className="bg-rose-950/90 border border-rose-500 text-rose-200 px-4 py-2 rounded-xl flex items-center justify-between text-xs shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span className="font-bold">
              ШТРАФ ЭНЕРГОСЕТИ: перегрузка оборудования! Штраф {gridPenalty.fineAmount} Br. Таймер блокировки: {formatPenaltyTime(gridPenalty.remainingSeconds)}.
            </span>
          </div>
          <button
            onClick={onOpenGridPenalty}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0 transition-colors"
          >
            Оплатить штраф сети →
          </button>
        </div>
      )}

      {/* TELEPORT BROKEN WARNING BANNER */}
      {isTeleportBroken && (
        <div className="bg-red-950/95 border-2 border-red-500 text-red-200 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl animate-pulse">
          <div className="flex items-center gap-2.5">
            <ZapOff className="w-5 h-5 text-red-400 shrink-0 animate-spin" />
            <div>
              <span className="font-black text-white text-sm">⚠️ ЭЛЕКТРОКАР ОТКЛЮЧЕН (СБОЙ ЗАРЯДКИ)! </span>
              <span className="text-red-300">
                {teleportRebootTimer > 0 ? (
                  <>Идёт авто-перезарядка: <strong className="text-amber-300 font-mono text-sm">{teleportRebootTimer} сек</strong></>
                ) : (
                  <>Требуется перезапуск: оплатите 100 Br или ждите 1 мин авто-перезарядки</>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPay100Teleport}
              disabled={player.money < 100}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                player.money >= 100
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Заплатить 100 Br (Мгновенно)</span>
            </button>
            <button
              onClick={onOpenTeleportGlitch}
              className="px-3 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-white font-semibold text-xs border border-red-400/50 cursor-pointer"
            >
              Подробнее...
            </button>
          </div>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="bg-[#121c19] border border-emerald-900/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Financial & Inventory */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Money */}
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-base tabular-nums">
            <DollarSign className="w-4 h-4" />
            <span>{player.money.toLocaleString()} Br</span>
          </div>

          <div className="hidden sm:block text-slate-600">·</div>

          {/* Raw Logs */}
          <div className="flex items-center gap-1.5 text-amber-200/90 text-sm">
            <span className="text-xs text-slate-400 font-mono">Брёвна:</span>
            <span className="font-semibold tabular-nums">{player.logs}</span>
          </div>

          {/* Planks */}
          <div className="flex items-center gap-1.5 text-amber-100 text-sm">
            <span className="text-xs text-slate-400 font-mono">Доски:</span>
            <span className="font-semibold tabular-nums">{player.planks}</span>
          </div>

          {/* Saplings */}
          <div className="flex items-center gap-1.5 text-emerald-300 text-sm">
            <span className="text-xs text-slate-400 font-mono">Саженцы:</span>
            <span className="font-semibold tabular-nums">{player.saplings}</span>
          </div>
        </div>

        {/* Center: Victory Goal Progress Tracker (1000 saplings & 100,000 Br) */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/50 text-xs">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Цель победы:</span>
            <span className={`font-bold ${player.treesPlanted >= 1000 ? 'text-emerald-400' : 'text-emerald-300'}`}>
              🌲 {player.treesPlanted} / 1000 саженцев
            </span>
            <span className="text-slate-600">·</span>
            <span className={`font-bold ${player.money >= 100000 ? 'text-emerald-400' : 'text-amber-300'}`}>
              💰 {player.money.toLocaleString()} Br / 100,000 Br
            </span>
          </div>
        </div>

        {/* Right: Quick Tools, Upgrades & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* UPGRADES MODAL BUTTON */}
          <button
            onClick={onOpenUpgrades}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/80 text-emerald-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Открыть меню Эко-Инженерии и апгрейдов [U]"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Апгрейды [U]</span>
          </button>

          {/* Notification Log Button */}
          <button
            onClick={onOpenNotificationLog}
            className="relative p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500 transition-colors cursor-pointer"
            title="Журнал надписей и оповещений"
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950 leading-none">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Bankruptcy Button */}
          <button
            onClick={onOpenBankruptcy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Объявить банкротство и завершить партию"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Банкрот</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Правила и эко-механики"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Teleport Status & Environmental Bar (No battery / energy bar!) */}
      <div className="bg-[#121c19]/90 border border-emerald-950 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Teleport Breakdown Risk & Status */}
        <div className="flex items-center gap-3">
          {gridPenalty.hasPenalty ? (
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold cursor-pointer" onClick={onOpenGridPenalty}>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>СЕТЬ БЛОКИРОВАНА ЗА ПЕРЕГРУЗКУ</span>
            </div>
          ) : isTeleportBroken ? (
            <div
              onClick={onOpenTeleportGlitch}
              className="flex items-center gap-1.5 text-red-400 font-bold bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-500 cursor-pointer animate-pulse hover:bg-red-900/60"
            >
              <ZapOff className="w-3.5 h-3.5 text-red-400" />
              <span>
                {teleportRebootTimer > 0
                  ? `СБОЙ ЭЛЕКТРОКАРА (Зарядка: ${teleportRebootTimer}с)`
                  : 'СБОЙ ЭЛЕКТРОКАРА (Выключен! Нажмите)'}
              </span>
            </div>
          ) : (
            <div
              onClick={onOpenTeleportGlitch}
              className="flex items-center gap-2 text-cyan-300 bg-slate-900/70 px-2.5 py-1 rounded-lg border border-cyan-800/40 cursor-pointer hover:border-cyan-500"
              title="Нажмите, чтобы посмотреть статус стабильности электромобиля"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Электрокар: <strong>ГОТОВ [T]</strong></span>
              <span className="text-slate-400 text-[11px]">
                (Риск сбоя: <strong className={teleportFailureChance > 10 ? 'text-amber-400' : 'text-emerald-400'}>{teleportFailureChance}%</strong>, панелей: {solarPanelsCount})
              </span>
            </div>
          )}
        </div>

        {/* Right: Environmental Info */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Day / Night indicator */}
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
            dayNight.isNight
              ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
              : 'bg-amber-950/40 border-amber-600/50 text-amber-300'
          }`}>
            {dayNight.isNight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="font-mono tabular-nums">{formatHours(dayNight.timeOfDay)}</span>
          </div>

          {/* Forest Health & Trees Left */}
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${getForestHealthColor()}`}>
            <TreePine className="w-3.5 h-3.5" />
            <span>
              {livingTreesCount !== undefined ? (
                <>Деревьев: <strong className="tabular-nums">{livingTreesCount} шт.</strong> <span className="text-[10px] text-slate-300 font-normal">(штраф при ≤ 2)</span></>
              ) : (
                <>Здоровье Леса: <strong className="tabular-nums">{Math.round(forestHealth)}%</strong></>
              )}
            </span>
          </div>

          {/* Inspector Audit Countdown */}
          <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Аудит: <strong className="text-emerald-400 font-mono tabular-nums">{Math.ceil(inspector.nextInspectionTime)}с</strong></span>
          </div>
        </div>
      </div>

      {/* Action Shortcut Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <button
          onClick={onInteractAction}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-800/30 hover:bg-amber-800/50 text-amber-200 border border-amber-700/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <TreePine className="w-4 h-4 text-amber-400" />
          <span>[Пробел] Рубка / Пила</span>
        </button>

        <button
          onClick={onPlantAction}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-700/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>[E] Посадить (+20 Br)</span>
        </button>

        <button
          onClick={onOpenTeleport}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
            isTeleportOnline
              ? 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border-cyan-700/40'
              : 'bg-red-950/40 text-red-300 border-red-800/60'
          }`}
        >
          {isTeleportBroken ? <ZapOff className="w-4 h-4 text-red-400" /> : <Navigation className="w-4 h-4 text-cyan-400" />}
          <span>{isTeleportBroken ? '[T] Сбой электрокара!' : '[T] Электрокар'}</span>
        </button>

        <button
          onClick={onOpenMarket}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-700/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>[M] Прилавок / Рынок</span>
        </button>

        <button
          onClick={onOpenStore}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-700/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-purple-400" />
          <span>Строймаг</span>
        </button>

        <button
          onClick={onOpenUpgrades}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 text-xs font-bold transition-all active:scale-95 cursor-pointer col-span-2 sm:col-span-1"
        >
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span>Апгрейды [U]</span>
        </button>
      </div>
    </div>
  );
};
