import React from 'react';
import { PlayerStats } from '../types/game';
import { Wrench, TreePine, ShieldCheck, Check, X, Sparkles, Sun, ShoppingBag } from 'lucide-react';

interface UpgradesModalProps {
  player: PlayerStats;
  axeLevel: number;
  hasBioFertilizer: boolean;
  hasEcoCertificate: boolean;
  solarPanelsCount: number;
  teleportFailureChance: number;
  onClose: () => void;
  onUpgradeAxe: () => void;
  onBuyBioFertilizer: () => void;
  onBuyEcoCertificate: () => void;
  onBuySaplingsBundle: () => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  player,
  axeLevel,
  hasBioFertilizer,
  hasEcoCertificate,
  solarPanelsCount,
  teleportFailureChance,
  onClose,
  onUpgradeAxe,
  onBuyBioFertilizer,
  onBuyEcoCertificate,
  onBuySaplingsBundle,
}) => {
  const axeCost = axeLevel === 1 ? 160 : axeLevel === 2 ? 420 : 0;
  const bioFertilizerCost = 140;
  const ecoCertificateCost = 250;
  const saplingsBundleCost = 100; // 15 saplings

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#101b17] border border-emerald-600/70 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-emerald-800/50 flex items-center justify-between bg-gradient-to-r from-emerald-950/90 via-[#13221c]/90 to-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/50 shadow-inner">
              <Wrench className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                Эко-Инженерия & Апгрейды
              </h2>
              <p className="text-xs text-emerald-300/80">
                Модернизация инструментов, био-удобрения и стабилизация телепорта
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Card 1: Tool / Axe */}
          <div className="p-4 rounded-xl bg-[#14231f] border border-slate-800 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {axeLevel === 1 && 'Топор -> Электропила "Лес-1"'}
                    {axeLevel === 2 && 'Электропила -> Бионический Лазер'}
                    {axeLevel >= 3 && 'Бионический Лазер (МАКСИМУМ)'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Ур. {axeLevel}/3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {axeLevel === 1 && 'Спиливает дерево в 2 раза быстрее и даёт больше брёвен.'}
                  {axeLevel === 2 && 'Мгновенная срезка ствола дерева за 1 удар лазерного луча!'}
                  {axeLevel >= 3 && 'Максимальный уровень заготовки древесины достигнут.'}
                </p>
              </div>
              <div className="text-right">
                {axeLevel < 3 ? (
                  <span className="text-sm font-bold text-amber-400">{axeCost} Br</span>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Макс
                  </span>
                )}
              </div>
            </div>

            {axeLevel < 3 && (
              <button
                onClick={onUpgradeAxe}
                disabled={player.money < axeCost}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  player.money >= axeCost
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Купить апгрейд инструмента (-{axeCost} Br)
              </button>
            )}
          </div>

          {/* Card 2: Solar Teleport Grid Stabilization Info */}
          <div className="p-4 rounded-xl bg-[#14231f] border border-cyan-900/60 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Солнечная Стабилизация Телепорта
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Базовый риск отключения телепорта: <strong>25%</strong>. Каждая солнечная панель снижает риск сбоя на <strong>5%</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Установлено панелей:</span>
                <span className="text-sm font-bold text-cyan-300">{solarPanelsCount} шт</span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Текущий риск сбоя:</span>
                <span className={`text-sm font-bold ${teleportFailureChance > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {teleportFailureChance}% {teleportFailureChance === 0 ? '(100% стабильно)' : ''}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              * Панели можно купить в Строймаркете через фуру доставки в лесу.
            </p>
          </div>

          {/* Card 3: Bio-Fertilizer for Saplings */}
          <div className="p-4 rounded-xl bg-[#14231f] border border-slate-800 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Ускоритель Био-Роста Деревьев</h3>
                  {hasBioFertilizer && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Активен
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Все посаженные саженцы вырастают во взрослые деревья в 2 раза быстрее.
                </p>
              </div>
              <div className="text-right">
                {!hasBioFertilizer ? (
                  <span className="text-sm font-bold text-amber-400">{bioFertilizerCost} Br</span>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Куплено
                  </span>
                )}
              </div>
            </div>

            {!hasBioFertilizer && (
              <button
                onClick={onBuyBioFertilizer}
                disabled={player.money < bioFertilizerCost}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  player.money >= bioFertilizerCost
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <TreePine className="w-3.5 h-3.5 inline mr-1" />
                Купить Био-Ускоритель (-{bioFertilizerCost} Br)
              </button>
            )}
          </div>

          {/* Card 4: Green Standard Eco-Certificate */}
          <div className="p-4 rounded-xl bg-[#14231f] border border-slate-800 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Сертификат "Зелёный Стандарт"</h3>
                  {hasEcoCertificate && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      Сертифицирован
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Снижает размер штрафа со 100 Br до 70 Br, если в лесу осталось всего 2 дерева.
                </p>
              </div>
              <div className="text-right">
                {!hasEcoCertificate ? (
                  <span className="text-sm font-bold text-amber-400">{ecoCertificateCost} Br</span>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Получен
                  </span>
                )}
              </div>
            </div>

            {!hasEcoCertificate && (
              <button
                onClick={onBuyEcoCertificate}
                disabled={player.money < ecoCertificateCost}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  player.money >= ecoCertificateCost
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                Оформить сертификат (-{ecoCertificateCost} Br)
              </button>
            )}
          </div>

          {/* Card 5: Saplings Bundle for 1000 Victory Goal */}
          <div className="p-4 rounded-xl bg-[#14231f] border border-slate-800 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Оптовый Пакет Саженцев (+15 шт)</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Мгновенно пополняет инвентарь 15 саженцами сосны и дуба. Помогает быстрее достичь цели в 1,000 деревьев! За каждое дерево вы получаете <strong>+20 Br</strong>.
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-400">{saplingsBundleCost} Br</span>
              </div>
            </div>

            <button
              onClick={onBuySaplingsBundle}
              disabled={player.money < saplingsBundleCost}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                player.money >= saplingsBundleCost
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              Купить 15 саженцев (-{saplingsBundleCost} Br)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-emerald-950 bg-emerald-950/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Баланс: <strong className="text-amber-400 font-bold">{player.money} Br</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Закрыть [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
