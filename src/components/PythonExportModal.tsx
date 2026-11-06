import React, { useState } from 'react';
import { PYTHON_GAME_CODE } from '../utils/pythonCode';
import { Code2, Download, Copy, Check, Terminal, BookOpen, X } from 'lucide-react';

interface PythonExportModalProps {
  onClose: () => void;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'guide'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_GAME_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_GAME_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eco_lumberjack.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#101a17] border border-emerald-700/60 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-emerald-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/40 border border-emerald-600/40">
              <Code2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Python + Pygame Исходный Код Игры
              </h2>
              <p className="text-xs text-emerald-300/70">
                Полный готовый автономный скрипт <code className="font-mono text-emerald-400">eco_lumberjack.py</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .py файл</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2 bg-[#0c1412] border-b border-emerald-950 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('code')}
            className={`text-xs font-medium pb-2 pt-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Код скрипта (eco_lumberjack.py)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`text-xs font-medium pb-2 pt-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Инструкция по запуску и архитектура</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden p-6">
          {activeTab === 'code' ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>Язык: Python 3.9+ | Библиотека: pygame | Строк: ~500</span>
                <span>Нажмите "Скачать .py файл" для запуска на вашем ПК</span>
              </div>
              <div className="flex-1 bg-[#090f0d] border border-slate-800 rounded-xl p-4 overflow-auto font-mono text-xs text-emerald-200/90 leading-relaxed selection:bg-emerald-700 selection:text-white">
                <pre>{PYTHON_GAME_CODE}</pre>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-6 text-sm text-slate-300 pr-2">
              {/* Step by step launch guide */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Как запустить игру локально на компьютере (Windows / Mac / Linux)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                  <li>
                    Убедитесь, что у вас установлен <strong>Python 3</strong> (скачать можно с{' '}
                    <a href="https://python.org" target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                      python.org
                    </a>
                    ).
                  </li>
                  <li>
                    Откройте командную строку (Terminal в macOS/Linux или cmd / PowerShell в Windows) и установите библиотеку <strong>pygame</strong>:
                    <div className="mt-1.5 p-2 bg-black/70 rounded border border-slate-700 font-mono text-emerald-300">
                      pip install pygame
                    </div>
                  </li>
                  <li>
                    Скачайте файл игры кнопкой <strong>"Скачать .py файл"</strong> выше (он сохранится как <code>eco_lumberjack.py</code>).
                  </li>
                  <li>
                    Запустите скрипт через терминал в папке с файлом:
                    <div className="mt-1.5 p-2 bg-black/70 rounded border border-slate-700 font-mono text-emerald-300">
                      python eco_lumberjack.py
                    </div>
                  </li>
                </ol>
              </div>

              {/* Architecture breakdown */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Архитектура кода и ключевые эко-механики
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#111c19] rounded-lg border border-emerald-900/50">
                    <h4 className="font-semibold text-emerald-300 mb-1">🌲 ООП-модель деревьев (Tree)</h4>
                    <p className="text-slate-400 leading-normal">
                      Реализованы 5 стадий: пень (STUMP), саженец (SAPLING), молодой дуб (YOUNG), взрослое дерево (MATURE) и священный дуб (ANCIENT). Саженцы растут со временем в игровом цикле.
                    </p>
                  </div>

                  <div className="p-3 bg-[#111c19] rounded-lg border border-cyan-900/50">
                    <h4 className="font-semibold text-cyan-300 mb-1">⚡ Энергосеть и Телепорты</h4>
                    <p className="text-slate-400 leading-normal">
                      Батарея питает квантовые телепорты (стоимость 20 кВт·ч). Если заряд &lt; 20%, телепорты блокируются, а скорость шага падает. Быстрая зарядка доступна у Солнечной Станции.
                    </p>
                  </div>

                  <div className="p-3 bg-[#111c19] rounded-lg border border-amber-900/50">
                    <h4 className="font-semibold text-amber-300 mb-1">💰 Эко-Рынок и Множитель цен</h4>
                    <p className="text-slate-400 leading-normal">
                      Лесопилка преобразует брёвна в доски. На рынке цена продажи досок динамически умножается на формулу здоровья леса: <code>1.0 + (health / 100) * 0.5</code>.
                    </p>
                  </div>

                  <div className="p-3 bg-[#111c19] rounded-lg border border-rose-900/50">
                    <h4 className="font-semibold text-rose-300 mb-1">📋 Эко-Инспектор и Штрафы</h4>
                    <p className="text-slate-400 leading-normal">
                      Штраф выписывается только если из всех деревьев осталось всего 2 дерева (или меньше). Проигрыш засчитывается, когда в лесу не осталось деревьев (0) и баланс равен 0$! Сажайте саженцы за 20$ для восстановления.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
