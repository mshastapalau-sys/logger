# logger
simple game for elocogy

**Эко-Лесоруб: Баланс Природы** — эко-экономическая браузерная игра (React 19 + TypeScript + Vite 8). Правила и управление — в [MANUAL.md](MANUAL.md).

Играть: https://mshastapalau-sys.github.io/logger/

## Запуск локально

Требуется Node.js.

```
npm install
npm run dev
```

Игра откроется на http://localhost:3000.

## Standalone-версия (офлайн, запуск с флешки)

```
npm run build:standalone
```

Собирает всю игру в `dist-standalone/`:

- `start-game.html` — вся игра в одном файле, открывается двойным кликом в любом современном браузере (Edge, Chrome, Firefox);
- `helper.bat` — вспомогательный лаунчер: открывает игру в окне приложения без адресной строки и кнопок навигации (через `--app` у Edge/Chrome; если их нет — открывает в браузере по умолчанию). При каждом запуске (пере)создаёт ярлыки `Eco-Lesorub.lnk` с иконкой-ёлкой — в папке и на рабочем столе;
- `icon.ico` — иконка игры (генерируется `node scripts/generate-icon.mjs`);
- `README.txt` — инструкция по запуску для конечного пользователя.

Интернет и сервер не нужны — папку можно скопировать на флешку и запускать оттуда.

Готовая сборка публикуется автоматически при пуше в `main`:

- ветка [`standalone`](../../tree/standalone) — файлы сборки (скачать: Code → Download ZIP);
- `https://mshastapalau-sys.github.io/logger/standalone.zip` — архив одним файлом с игрового сайта.

## Деплой

Автоматически: после каждого push в `main` GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) проверяет типы, собирает игру и публикует `dist` в ветку `gh-pages` (GitHub Pages). На pull request в `main` выполняются только проверка типов и сборка.

Вручную (при необходимости):

```
npm run deploy
```
