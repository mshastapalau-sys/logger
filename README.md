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

## Деплой

Автоматически: после каждого push в `main` GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) проверяет типы, собирает игру и публикует `dist` в ветку `gh-pages` (GitHub Pages). На pull request в `main` выполняются только проверка типов и сборка.

Вручную (при необходимости):

```
npm run deploy
```
