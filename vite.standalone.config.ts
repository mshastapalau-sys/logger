import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

const outDir = 'dist-standalone';
const htmlName = 'start-game.html';
const batName = 'helper.bat';
const lnkName = 'Eco-Lesorub.lnk';

// helper.bat: открывает start-game.html в окне приложения без адресной строки
// и кнопок навигации (флаг --app у Edge/Chrome). %~dp0 — папка батника, работает
// с любой буквой флешки. При каждом запуске (пере)создаёт ярлык Eco-Lesorub.lnk
// с иконкой icon.ico: цель ярлыка — %ComSpec% /c helper.bat, поэтому ярлык
// остаётся рабочим при переносе папки на другой диск (helper.bat ищется
// относительно папки ярлыка). Фолбэк — обычное окно браузера по умолчанию.
const launcherBat = [
  '@echo off',
  'rem Eco-Lesorub helper: opens start-game.html in an app window (no address bar).',
  'setlocal',
  `set "URL=file:///%~dp0${htmlName}"`,
  'set "URL=%URL:\\=/%"',
  '',
  'set "BROWSER="',
  'if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe"',
  'if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"',
  'if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "BROWSER=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"',
  'if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"',
  'if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"',
  '',
  'if defined BROWSER (',
  '  start "" "%BROWSER%" --app="%URL%"',
  ') else (',
  `  start "" "%~dp0${htmlName}"`,
  ')',
  '',
  `powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%~dp0${lnkName}');$s.TargetPath='%ComSpec%';$s.Arguments='/c ${batName}';$s.IconLocation='%~dp0icon.ico';$s.Description='Eco-Lesorub';$s.WindowStyle=7;$s.Save()" >nul 2>nul`,
  '',
].join('\r\n');

// README.txt для конечного пользователя — кладётся рядом с игрой в dist-standalone.
// UTF-8 с BOM + CRLF, чтобы Блокнот корректно показал кириллицу.
const standaloneReadme = [
  'Эко-Лесоруб: Баланс Природы — офлайн-версия',
  '==========================================',
  '',
  'КАК ЗАПУСТИТЬ (на выбор):',
  '',
  '1) Eco-Lesorub.lnk — игра в отдельном окне без адресной строки.',
  '   Ярлык появляется после первого запуска helper.bat.',
  '',
  '2) helper.bat — то же окно приложения + создаёт ярлык выше.',
  '',
  `3) ${htmlName} — двойной клик, игра откроется в обычном окне браузера.`,
  '',
  'Что нужно: Windows и современный браузер (Edge, Chrome, Firefox).',
  'Интернет НЕ нужен. Все файлы должны лежать в одной папке —',
  'папку можно копировать целиком, в том числе на флешку.',
  '',
  'Правила и управление: кнопка «Правила» в игре (клавиша R).',
  '',
].join('\r\n');

// Офлайн-сборка: весь JS/CSS инлайнится в один HTML-файл + helper.bat + icon.ico.
// Исходник-точка входа — standalone.entry.html в корне (открывать напрямую НЕЛЬЗЯ).
export default defineConfig(() => {
  const emitOutput: Plugin = {
    name: 'emit-standalone-output',
    closeBundle() {
      fs.renameSync(
        path.join(outDir, 'standalone.entry.html'),
        path.join(outDir, htmlName),
      );
      fs.copyFileSync(
        path.resolve(import.meta.dirname, 'standalone-assets/icon.ico'),
        path.join(outDir, 'icon.ico'),
      );
      fs.writeFileSync(path.join(outDir, batName), launcherBat);
      fs.writeFileSync(path.join(outDir, 'README.txt'), `\uFEFF${standaloneReadme}`);
    },
  };

  return {
    plugins: [react(), tailwindcss(), viteSingleFile(), emitOutput],
    publicDir: false as const,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      outDir,
      rollupOptions: {
        input: path.resolve(import.meta.dirname, 'standalone.entry.html'),
      },
    },
  };
});
