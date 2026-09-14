# Молодёжный дайджест Калининграда

PWA-приложение с дайджестом активных событий для молодёжи Калининграда.

## Возможности

- Дайджест событий по неделям
- Фильтрация по категориям (спорт, экология, творчество и др.)
- Поиск по событиям
- Оффлайн-режим
- Мобильная адаптация (работает на iOS/Android без App Store)
- Автоматический парсинг открытых источников

## Стек технологий

### Фронтенд
- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Vite Plugin PWA

### Парсер (бэкенд)
- Python 3.10+
- requests
- BeautifulSoup4

## Быстрый старт

### 1. Установка зависимостей

```bash
# Фронтенд
cd frontend
npm install

# Парсер (опционально)
cd parser
pip install -r requirements.txt
```

### 2. Запуск в режиме разработки

```bash
cd frontend
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### 3. Сборка для продакшена

```bash
cd frontend
npm run build
```

Результат будет в папке `frontend/dist/`.

### 4. Запуск парсера

```bash
cd parser
python parser.py
```

## Деплой

### Вариант 1: GitHub Pages (рекомендуется)

1. Создайте репозиторий на GitHub
2. Загрузите проект:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kaliningrad-youth-digest.git
git push -u origin main
```
3. Перейдите в Settings → Pages
4. Выберите "GitHub Actions" как источник
5. Приложение будет доступно по адресу:
   `https://YOUR_USERNAME.github.io/kaliningrad-youth-digest/`

### Вариант 2: Vercel

```bash
# Установите Vercel CLI
npm install -g vercel

# В папке frontend
vercel
```

### Вариант 3: Netlify

1. Зайдите на https://app.netlify.com/
2. Перетащите папку `frontend/dist`
3. Приложение будет доступно по адресу:
   `https://YOUR_SITE.netlify.app/`

### Автоматический деплой

Запустите скрипт деплоя:
```bash
deploy.bat
```

## Структура проекта

```
kaliningrad-youth-digest/
├── .github/workflows/    # GitHub Actions
├── data/                 # Данные событий (JSON)
├── frontend/            # React приложение
│   ├── public/          # Статические файлы
│   ├── src/
│   │   ├── components/  # Компоненты
│   │   ├── pages/       # Страницы
│   │   ├── App.jsx      # Главный компонент
│   │   └── main.jsx     # Точка входа
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── parser/              # Парсер событий
│   ├── config.py        # Конфигурация
│   ├── parser.py        # Основной парсер
│   └── requirements.txt
├── deploy.bat           # Скрипт деплоя
└── README.md
```

## Добавление новых источников

1. Откройте `parser/config.py`
2. Добавьте источник в список `SOURCES`:
```python
{
    "name": "Название источника",
    "url": "https://example.com/events",
    "type": "events",
    "enabled": True,
}
```
3. Запустите парсер: `python parser/parser.py`

## Настройка фильтрации

### Ключевые слова

В `parser/config.py` настройте:
- `KEYWORDS_YOUTH` — молодёжные ключевые слова
- `KEYWORDS_TOPICS` — тематические ключевые слова
- `EXCLUDE_KEYWORDS` — слова-исключения

### Категории

В `parser/config.py` настройте категории в словаре `CATEGORIES`.

## Оффлайн-режим

Приложение автоматически кэширует данные для работы без интернета. При первом запуске загружаются все данные, затем обновляются при наличии соединения.

## Безопасность

- Фильтрация контента по ключевым словам
- Исключение экстремистских и политических материалов
- Только открытые источники
- Нет сбора персональных данных

## Лицензия

MIT
