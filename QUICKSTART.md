# Быстрый старт AI Terminal IDE

## Предварительные требования

- Node.js 18+ и npm
- Для Windows: Python и Build Tools (для node-pty)
- Git

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

**Возможные проблемы:**

**На Windows:**
Если `node-pty` не собирается, установите:
```bash
npm install --global windows-build-tools
```

**На Linux:**
Убедитесь, что установлены build-essential:
```bash
sudo apt-get install build-essential python3
```

**На macOS:**
```bash
xcode-select --install
```

### 2. Настройка окружения (опционально)

Создайте `.env` файл (копируйте из `.env.example`):

```bash
cp .env.example .env
```

Отредактируйте `.env`:
```bash
PORT=3001
AI_API_URL=http://localhost:8000
AI_API_KEY=your-api-key-here
AI_DEFAULT_MODEL=gpt-3.5-turbo
NODE_ENV=development
```

### 3. Запуск в режиме разработки

**Вариант A: Все сервисы сразу (рекомендуется)**

```bash
npm run dev
```

Это запустит:
- Backend на `http://localhost:3001`
- Frontend на `http://localhost:5173`
- Electron приложение

**Вариант B: Запуск компонентов отдельно**

Терминал 1 - Backend:
```bash
npm run dev:backend
```

Терминал 2 - Frontend:
```bash
npm run dev:frontend
```

Терминал 3 - Electron:
```bash
npm run dev:electron
```

### 4. Первоначальная настройка в приложении

1. Приложение откроется автоматически
2. Нажмите кнопку **⚙️ Settings** в правом верхнем углу
3. Заполните настройки:
   - **Project Path**: `/path/to/your/project` (например, `/home/user/myproject`)
   - **AI API URL**: `http://localhost:8000` (URL вашего AI API)
   - **API Key**: ваш ключ API
   - **Default Model**: `gpt-3.5-turbo` или ваша модель
   - **Temperature**: 0.2 (можно изменить)
   - **Max Tokens**: 1024 (можно изменить)
4. Нажмите **Save**

### 5. Проверка работоспособности

#### Backend API
```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Frontend
Откройте в браузере: `http://localhost:5173`

#### WebSocket (Terminal)
В браузерной консоли не должно быть ошибок WebSocket

## Использование

### 1. Открытие проекта

- Укажите путь к проекту в Settings
- Файловое дерево появится слева
- Кликните на файл для открытия в редакторе

### 2. Редактирование кода

- Используйте Monaco Editor в центре
- Все изменения можно сохранить (Ctrl/Cmd + S)
- Поддерживаются все горячие клавиши VS Code

### 3. Терминал

- Терминал находится внизу
- Выполняйте команды как в обычном терминале:
  ```bash
  ls -la
  npm install
  git status
  ```

### 4. AI помощник

Панель справа для взаимодействия с AI:

**Примеры запросов:**
```
Создай React компонент Button с TypeScript
```
```
Объясни этот код и предложи улучшения
```
```
Найди баги в этой функции
```

**С контекстом файла:**
1. Откройте файл в редакторе
2. Задайте вопрос в AI панели
3. AI получит доступ к содержимому файла

## Сборка для production

### 1. Сборка всех компонентов

```bash
npm run build
```

Это создаст:
- `dist/backend/` - скомпилированный backend
- `dist/frontend/` - собранный frontend
- `dist/electron/` - electron главный процесс

### 2. Запуск production версии

```bash
npm start
```

## Тестирование компонентов

### Тест Backend API

```bash
# Health check
curl http://localhost:3001/health

# Список файлов
curl "http://localhost:3001/api/files?path=/home/user/project"

# Чтение файла
curl "http://localhost:3001/api/file?path=/home/user/project/test.js"

# Настройки
curl http://localhost:3001/api/settings
```

### Тест AI интеграции

```bash
curl -X POST http://localhost:3001/api/ai/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Напиши функцию для сложения двух чисел",
    "model": "gpt-3.5-turbo"
  }'
```

### Тест безопасности команд

```bash
curl -X POST http://localhost:3001/api/security/validate-command \
  -H "Content-Type: application/json" \
  -d '{"command": "rm -rf /"}'
```

## Решение проблем

### node-pty не устанавливается

**Windows:**
```bash
npm install --global --production windows-build-tools
npm install node-pty --build-from-source
```

**Linux:**
```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

### Backend не запускается

Проверьте, что порт 3001 свободен:
```bash
# Linux/Mac
lsof -i :3001

# Windows
netstat -ano | findstr :3001
```

Убейте процесс или измените PORT в `.env`

### WebSocket не подключается

1. Проверьте, что backend работает
2. Проверьте консоль браузера на ошибки
3. Убедитесь, что firewall не блокирует порт 3001

### Electron не запускается

```bash
# Очистите кэш
rm -rf node_modules/.cache

# Переустановите electron
npm install electron --save-dev
```

### AI API не отвечает

1. Убедитесь, что ваш AI API работает
2. Проверьте URL и API key в Settings
3. Посмотрите логи backend для деталей ошибки

### База данных не создается

```bash
# Создайте директорию вручную
mkdir -p data

# Проверьте права
chmod 755 data
```

## Структура проекта после установки

```
ai-terminal-ide/
├── node_modules/          # Зависимости
├── data/                  # База данных SQLite
│   └── ai-terminal-ide.db
├── dist/                  # Сборка
│   ├── backend/
│   ├── frontend/
│   └── electron/
├── src/                   # Исходный код
├── docs/                  # Документация
└── package.json
```

## Следующие шаги

1. Прочитайте [README.md](README.md) для полной документации
2. Изучите [docs/EXAMPLES.md](docs/EXAMPLES.md) для примеров использования
3. Посмотрите [docs/API.md](docs/API.md) для API документации
4. Ознакомьтесь с [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) для понимания архитектуры

## Полезные команды

```bash
# Линтинг
npm run lint

# Форматирование
npm run format

# Очистка
rm -rf node_modules dist data
npm install

# Логи backend
npm run dev:backend | tee backend.log

# Только frontend для отладки
npm run dev:frontend
```

## Порты по умолчанию

- **Backend API**: http://localhost:3001
- **Frontend Dev**: http://localhost:5173
- **WebSocket**: ws://localhost:3001/ws
- **Electron**: Desktop приложение

## Дополнительная информация

- GitHub Issues: (добавьте ссылку)
- Documentation: `/docs`
- Examples: `/docs/EXAMPLES.md`
