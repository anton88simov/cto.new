# AI Terminal IDE - Шпаргалка

## ⚡ Команды запуска

```bash
npm install                    # Установка
npm run dev                    # Запуск всего
npm run dev:backend            # Только backend
npm run dev:frontend           # Только frontend
npm run build                  # Сборка
npm start                      # Production
```

## 🔍 Проверка

```bash
./test-setup.sh               # Проверка установки
./test-backend.sh             # Тест backend
curl http://localhost:3001/health  # Health check
```

## 📝 Первый запуск

1. `npm install`
2. `npm run dev`
3. Settings → Заполнить Project Path и AI API
4. Выбрать файл слева → начать редактирование

## 🎨 Интерфейс

```
┌─────────────────────────────────────────────┐
│ AI Terminal IDE          [⚙️ Settings]      │
├──────┬───────────────────────┬──────────────┤
│ 📁   │  📝 Editor            │  💬 AI Chat  │
│ File │  (Monaco)             │              │
│ Tree │                       │  History     │
│      ├───────────────────────┤              │
│      │  💻 Terminal          │              │
│      │  (xterm)              │              │
└──────┴───────────────────────┴──────────────┘
```

## ⌨️ Горячие клавиши

### Редактор
- `Ctrl/Cmd + S` - Сохранить
- `Ctrl/Cmd + F` - Найти
- `Ctrl/Cmd + H` - Заменить
- `Ctrl/Cmd + /` - Комментировать
- `Alt + ↑/↓` - Переместить строку
- `Ctrl/Cmd + D` - Выбрать следующее совпадение

### Терминал
- `Ctrl + C` - Прервать процесс
- `Ctrl + L` - Очистить
- `↑/↓` - История команд
- `Tab` - Автодополнение

## 🤖 AI Промпты

### Генерация кода
```
Создай React компонент UserCard с пропсами name, avatar, email
```

### Рефакторинг
```
Переименуй функцию getUserData в fetchUserData по всему файлу
```

### Исправление багов
```
В этом коде useEffect вызывается бесконечно. Исправь
```

### Тесты
```
Напиши Jest тесты для функции calculateTotal
```

### Документация
```
Добавь JSDoc комментарии к этой функции
```

## 🔌 API Endpoints

```bash
# Health
GET /health

# Файлы
GET /api/files?path=/path/to/dir
GET /api/file?path=/path/to/file.js
POST /api/file (body: {path, content})
DELETE /api/file?path=/path/to/file.js

# AI
POST /api/ai/completion
{
  "prompt": "Your question",
  "model": "gpt-3.5-turbo",
  "context": {"files": ["/path/to/file.js"]}
}

# История
GET /api/history?limit=50&offset=0

# Настройки
GET /api/settings
POST /api/settings

# Безопасность
POST /api/security/validate-command
{"command": "ls -la"}

# Индексация
POST /api/indexer/index
{"projectPath": "/path/to/project"}
```

## 🌐 WebSocket

```javascript
ws://localhost:3001/ws

// Создать терминал
{"type": "terminal:create", "cwd": "/path"}

// Ввод в терминал
{"type": "terminal:input", "sessionId": "...", "input": "ls\n"}

// Стриминг AI
{"type": "ai:stream", "requestId": "...", "request": {...}}
```

## 📊 Переменные окружения (.env)

```bash
PORT=3001
AI_API_URL=http://localhost:8000
AI_API_KEY=your-key
AI_DEFAULT_MODEL=gpt-3.5-turbo
NODE_ENV=development
```

## 🔧 Решение проблем

### node-pty не устанавливается
```bash
# Linux
sudo apt-get install build-essential python3
npm rebuild node-pty

# macOS
xcode-select --install
npm rebuild node-pty

# Windows
npm install --global windows-build-tools
```

### Порт занят
```bash
lsof -i :3001              # Найти процесс
kill -9 <PID>              # Убить
# или
echo "PORT=3002" >> .env   # Изменить порт
```

### Backend не отвечает
```bash
# Проверить логи
npm run dev:backend

# Проверить health
curl http://localhost:3001/health

# Перезапустить
pkill -f "node.*backend"
npm run dev:backend
```

### WebSocket не работает
```bash
# Проверить в консоли браузера (F12)
# Должно быть: WebSocket connected

# Перезапустить backend
npm run dev:backend
```

## 📂 Структура файлов

```
src/
├── backend/
│   ├── index.ts              # Главный сервер
│   ├── routes/
│   │   └── index.ts          # API роуты
│   └── services/
│       ├── ai.service.ts     # AI интеграция
│       ├── terminal.service.ts
│       ├── indexer.service.ts
│       ├── security.service.ts
│       ├── database.service.ts
│       └── file.service.ts
├── frontend/
│   ├── main.tsx              # Точка входа
│   ├── App.tsx               # Главный компонент
│   ├── components/
│   │   ├── Editor.tsx
│   │   ├── Terminal.tsx
│   │   ├── FileTree.tsx
│   │   ├── AIPanel.tsx
│   │   └── SettingsPanel.tsx
│   └── styles/
└── electron/
    └── main.ts               # Electron процесс
```

## 🎯 Типичные сценарии

### 1. Открыть проект
```
Settings → Project Path → /path/to/project → Save
```

### 2. Редактировать файл
```
Файл в дереве → Клик → Редактировать → Ctrl+S
```

### 3. Запустить команду
```
Терминал → npm test → Enter
```

### 4. Спросить AI
```
AI Panel → "Объясни этот код" → Send
```

### 5. Сгенерировать компонент
```
AI: "Создай компонент Login с формой email/password"
→ Копировать код → Вставить в редактор → Сохранить
```

## 🔐 Безопасность

- ✅ API ключи шифруются
- ✅ Опасные команды блокируются
- ✅ Секреты фильтруются из вывода
- ✅ Только локальное хранение данных
- ✅ Валидация путей файлов

## 📈 Производительность

- Индексация: до 10000 файлов
- Terminal: полная поддержка PTY
- AI: стриминг ответов
- Editor: Monaco (как в VS Code)

## 🚀 Production сборка

```bash
npm run build     # Собрать
npm start         # Запустить

# Результат в dist/:
# - dist/backend/
# - dist/frontend/
# - dist/electron/
```

## 💾 База данных

Локальная SQLite в `data/ai-terminal-ide.db`:
- История AI запросов
- Настройки пользователя
- Сессии (будущее)

```bash
# Посмотреть базу
sqlite3 data/ai-terminal-ide.db ".tables"
sqlite3 data/ai-terminal-ide.db "SELECT * FROM ai_requests LIMIT 5"
```

## 📚 Документация

- `README.md` - Полное описание
- `ЗАПУСК.md` - Инструкция на русском
- `QUICKSTART.md` - Быстрый старт
- `docs/API.md` - API документация
- `docs/ARCHITECTURE.md` - Архитектура
- `docs/EXAMPLES.md` - Примеры

## ⚠️ Важно

1. **Не коммитить** `.env` с API ключами
2. **Использовать** `.gitignore`
3. **Проверять** опасные команды в терминале
4. **Сохранять** важные данные перед экспериментами
5. **Читать** логи при ошибках

---

**Вопросы?** Читайте `ЗАПУСК.md` или `QUICKSTART.md`
