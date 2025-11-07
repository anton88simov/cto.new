# Инструкция по сборке AI Terminal IDE в .exe установщик

## 🎯 Цель

Собрать полноценное desktop приложение с единым .exe установщиком, которое будет работать как Cursor - с интегрированными:
- Редактором кода (Monaco)
- Терминалом
- AI панелью
- Деревом файлов

## 📋 Предварительные требования

### Windows (для сборки .exe)
```bash
# Node.js 18+ и npm
node --version  # должно быть >= 18

# Python (для node-pty и native modules)
python --version  # должно быть 3.x

# Windows Build Tools (если еще не установлены)
npm install --global windows-build-tools
```

### Linux/macOS
```bash
# Node.js 18+
node --version

# Build tools
# Ubuntu/Debian:
sudo apt-get install build-essential

# macOS:
xcode-select --install
```

## 🚀 Процесс сборки

### Шаг 1: Установка зависимостей

```bash
# Установить все зависимости включая electron-builder
npm install
```

### Шаг 2: Сборка всех компонентов

```bash
# Собрать backend, frontend и electron
npm run build
```

Это выполнит:
1. `npm run build:backend` - компиляция TypeScript backend → `dist/backend/`
2. `npm run build:frontend` - сборка React приложения → `dist/frontend/`
3. `npm run build:electron` - компиляция Electron → `dist/electron/`

### Шаг 3: Создание установщика

**Для Windows (.exe):**
```bash
npm run package:win
```

**Для macOS (.dmg):**
```bash
npm run package:mac
```

**Для Linux (.AppImage, .deb):**
```bash
npm run package:linux
```

**Универсальная команда:**
```bash
npm run package
```

### Результаты сборки

После успешной сборки установщик будет находиться в папке `release/`:

```
release/
├── win-unpacked/               # Распакованное приложение (для тестирования)
├── AI Terminal IDE Setup 0.1.0.exe  # УСТАНОВЩИК ДЛЯ WINDOWS
└── latest.yml                  # Metadata для auto-update
```

## 📦 Что включено в установщик

1. **Electron приложение** с встроенным:
   - Monaco Editor
   - xterm.js терминал
   - React UI компоненты

2. **Backend сервер** (Node.js):
   - Express API
   - WebSocket сервер
   - Все сервисы (AI, Terminal, Indexer, etc.)

3. **Node.js модули**:
   - node-pty (для терминала)
   - better-sqlite3 (для БД)
   - Все необходимые зависимости

4. **Ресурсы**:
   - Иконки
   - Стили
   - Конфигурация

## 🎮 Как использовать установщик

### Установка

1. **Запустите** `AI Terminal IDE Setup 0.1.0.exe`
2. **Выберите** папку для установки (по умолчанию: `C:\Program Files\AI Terminal IDE`)
3. **Дождитесь** завершения установки
4. **Запустите** приложение через:
   - Ярлык на рабочем столе
   - Меню Пуск → AI Terminal IDE
   - Файл `AI Terminal IDE.exe` в папке установки

### Первый запуск

1. Приложение откроется автоматически
2. Backend сервер запустится в фоне (порт 3001)
3. Интерфейс загрузится через 2-3 секунды
4. Настройте через Settings:
   - Project Path
   - AI API URL
   - API Key

### Что видит пользователь

```
┌────────────────────────────────────────────────────┐
│  AI Terminal IDE                    [⚙️ Settings]  │
├──────────┬──────────────────────┬──────────────────┤
│  📁      │   📝 Editor          │  💬 AI Chat      │
│  Files   │   (Monaco)           │                  │
│  Tree    │                      │  History         │
│          ├──────────────────────┤                  │
│          │  💻 Terminal         │                  │
│          │  (xterm)             │                  │
└──────────┴──────────────────────┴──────────────────┘
```

## 🔧 Настройки сборки

### Изменение версии

В `package.json`:
```json
{
  "version": "0.1.0"  // Измените здесь
}
```

### Изменение иконки

1. Создайте иконки:
   - `build/icon.ico` (256x256 для Windows)
   - `build/icon.icns` (для macOS)
   - `build/icon.png` (512x512 для Linux)

2. Используйте инструменты:
   - https://icon.kitchen/
   - https://cloudconvert.com/

### Настройка NSIS установщика (Windows)

В `package.json` → `build.nsis`:
```json
{
  "nsis": {
    "oneClick": false,              // Настраиваемая установка
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "installerIcon": "build/installer.ico",
    "uninstallerIcon": "build/uninstaller.ico"
  }
}
```

## 🐛 Решение проблем при сборке

### Ошибка: "node-pty build failed"

**Windows:**
```bash
npm install --global windows-build-tools
npm rebuild node-pty
```

**Linux:**
```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

### Ошибка: "better-sqlite3 build failed"

```bash
npm rebuild better-sqlite3
```

### Ошибка: "Cannot find module"

```bash
# Очистите и переустановите
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Приложение не запускается после установки

1. Проверьте логи:
   - Windows: `%APPDATA%\AI Terminal IDE\logs`
   
2. Запустите из командной строки:
   ```bash
   "C:\Program Files\AI Terminal IDE\AI Terminal IDE.exe"
   ```

3. Проверьте, что порт 3001 свободен

### Backend не стартует

1. Проверьте, что `dist/backend/` существует
2. Убедитесь, что все зависимости включены в сборку
3. Проверьте пути в `src/electron/main.ts`

## 📊 Размер установщика

Примерный размер:
- **Установщик**: ~150-200 MB
- **Установленное приложение**: ~300-400 MB
- **После первого запуска** (с БД): ~350-450 MB

Включает:
- Electron runtime (~100 MB)
- Node.js modules (~100 MB)
- Monaco Editor (~50 MB)
- Остальное (~50 MB)

## 🚀 Оптимизация размера

### 1. Удалите dev dependencies из production

В `package.json`:
```json
{
  "build": {
    "files": [
      "dist/**/*",
      "!node_modules/**/*.{md,ts,map}",
      "!node_modules/.bin"
    ]
  }
}
```

### 2. Используйте asar архивы

```json
{
  "build": {
    "asar": true
  }
}
```

### 3. Compress с UPX

```json
{
  "build": {
    "compression": "maximum"
  }
}
```

## 🎯 Тестирование сборки

### Перед созданием установщика

```bash
# 1. Соберите приложение
npm run build

# 2. Запустите production версию локально
npm start
```

### После создания установщика

1. **Установите** на чистую систему
2. **Проверьте**:
   - ✅ Приложение запускается
   - ✅ Backend работает (Settings → Health check)
   - ✅ Терминал подключается
   - ✅ Можно открыть проект
   - ✅ Редактор работает
   - ✅ AI панель доступна

## 📝 Чеклист перед релизом

- [ ] Обновлена версия в `package.json`
- [ ] Созданы правильные иконки
- [ ] Протестирована dev версия
- [ ] Собран production build
- [ ] Протестирован установщик
- [ ] Проверена работа на чистой системе
- [ ] Обновлена документация
- [ ] Созданы release notes

## 🔄 Auto-update (опционально)

Для добавления автообновлений:

1. Настройте сервер для обновлений
2. Добавьте в `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "ai-terminal-ide"
    }
  }
}
```

3. Используйте `electron-updater`:

```bash
npm install electron-updater
```

## 📚 Дополнительная информация

- [electron-builder документация](https://www.electron.build/)
- [NSIS настройки](https://www.electron.build/configuration/nsis)
- [Code signing](https://www.electron.build/code-signing)

## 🎉 Готово!

После выполнения всех шагов у вас будет полноценный установщик `.exe`, который:
- ✅ Устанавливается как обычная программа
- ✅ Создает ярлыки на рабочем столе и в меню
- ✅ Запускает полноценную IDE с терминалом
- ✅ Работает автономно без дополнительных зависимостей
- ✅ Можно удалить через "Программы и компоненты"

Запустите:
```bash
npm run package:win
```

И получите готовый к распространению установщик! 🚀
