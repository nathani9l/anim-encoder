# Anim Encoder — Project Context

## Что это
Веб-инструмент для конвертации PNG-последовательностей (с альфа-каналом) в собственный формат анимации `.uxuitelno`.
Формат представляет собой бинарный контейнер: [4 байта — длина манифеста][JSON манифест][AVIF sprite sheet].

## Зачем
Чтобы использовать 3D-анимации с прозрачностью нативно в Android (Kotlin) и iOS (Swift) приложениях.
Аналог формата Lava от Airbnb, но открытый.

## Стек
- **Backend**: Python, FastAPI, Pillow (AVIF encoding), uvicorn
- **Frontend**: React, Vite, vanilla CSS (без UI-библиотек)
- **Порты**: backend :8000, frontend :5173 (proxy /api → :8000)

## Структура проекта
```
anim-encoder/
├── backend/
│   ├── main.py        — FastAPI, endpoint POST /api/encode
│   ├── encoder.py     — сборка sprite sheet, AVIF сжатие, pack_anim()
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx        — главный компонент, состояние
        ├── index.css      — CSS переменные, базовые стили
        └── components/
            ├── DropZone.jsx    — drag & drop PNG файлов/папок
            ├── Preview.jsx     — живой canvas-preview анимации
            ├── Settings.jsx    — слайдеры fps, quality, toggle loop
            ├── ExportPanel.jsx — кнопка encode, статистика, download
            └── CodeSnippet.jsx — сниппеты для Kotlin и Swift

```

## Формат .uxuitelno
```
[4 bytes LE uint32] — длина JSON манифеста
[N bytes UTF-8]     — JSON манифест
[остаток]           — AVIF sprite sheet (все кадры в сетке cols×rows)
```
Манифест содержит: version, frameCount, frameWidth, frameHeight, cols, rows, fps, loop.

## Как запускать локально
```bash
# Терминал 1 — бэкенд
cd ~/Documents/anim-encoder/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Терминал 2 — фронтенд
cd ~/Documents/anim-encoder/frontend
npm run dev
# → http://localhost:5173
```

## Статус
- [x] Базовый энкодер работает локально
- [ ] GitHub репозиторий
- [ ] Деплой на сервер
- [ ] Поддержка перетаскивания папки целиком (не только файлов)
- [ ] Прогресс-бар во время энкодинга
- [ ] Тёмная/светлая тема переключатель
