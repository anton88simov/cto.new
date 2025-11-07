# 🚀 Как собрать .exe установщик для AI Terminal IDE

## Самый простой способ

### Вариант 1: Автоматический скрипт

```bash
./build-installer.sh
```

Скрипт спросит, какую платформу собрать, и сделает все автоматически.

### Вариант 2: Вручную (3 команды)

```bash
# 1. Установить electron-builder (если еще не установлен)
npm install

# 2. Собрать все компоненты
npm run build

# 3. Создать установщик для Windows
npm run package:win
```

**Готово!** Установщик будет в папке `release/`

## Что получится

После выполнения команд в папке `release/` появится:

```
release/
├── AI Terminal IDE Setup 0.1.0.exe  ← ЭТО ВАШ УСТАНОВЩИК
└── win-unpacked/                    ← Распакованная версия (для теста)
```

## Установка и запуск

1. **Запустите** `AI Terminal IDE Setup 0.1.0.exe`
2. **Выберите** папку установки
3. **Дождитесь** окончания
4. **Запустите** через ярлык на рабочем столе

### Что увидите при запуске

```
┌────────────────────────────────────────────────────────────┐
│  AI Terminal IDE                         [⚙️ Settings]     │
├────────────┬────────────────────────┬─────────────────────┤
│  📁 Files  │  📝 Monaco Editor      │  💬 AI Assistant    │
│  Project   │  Code editing          │  Chat with AI       │
│  Tree      │  Syntax highlight      │                     │
│            │                        │  📜 History         │
│            ├────────────────────────┤                     │
│            │  💻 Terminal (xterm)   │                     │
│            │  bash/powershell       │                     │
└────────────┴────────────────────────┴─────────────────────┘
```

## Требования для сборки

### Windows
```bash
# Node.js 18+
node --version

# Python (для native modules)
python --version

# Если node-pty не собирается:
npm install --global windows-build-tools
```

### Linux
```bash
sudo apt-get install build-essential python3
```

### macOS
```bash
xcode-select --install
```

## Размер установщика

- **Установщик**: ~150-200 MB
- **После установки**: ~300-400 MB

Включает все необходимое:
- Electron
- Node.js runtime
- Monaco Editor
- Terminal (node-pty)
- Backend сервер
- Все зависимости

## Проблемы и решения

### ❌ "node-pty build failed"

```bash
# Windows
npm install --global windows-build-tools
npm rebuild node-pty

# Linux
sudo apt-get install build-essential
npm rebuild node-pty
```

### ❌ "Cannot find module"

```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
npm run package:win
```

### ❌ Установщик не создается

```bash
# Проверьте логи
npm run package:win --verbose

# Убедитесь, что dist/ папки существуют
ls -la dist/
```

## Команды сборки

```bash
# Только сборка (без установщика)
npm run build

# Установщик для Windows
npm run package:win

# Установщик для macOS
npm run package:mac

# Установщик для Linux
npm run package:linux

# Все платформы
npm run package
```

## Настройка иконки

Положите свои иконки в папку `build/`:

```
build/
├── icon.ico   (для Windows, 256x256)
├── icon.icns  (для macOS)
└── icon.png   (для Linux, 512x512)
```

Генераторы иконок:
- https://icon.kitchen/
- https://cloudconvert.com/

## Что делает установщик

1. ✅ Устанавливает приложение в `Program Files`
2. ✅ Создает ярлык на рабочем столе
3. ✅ Добавляет в меню Пуск
4. ✅ Регистрирует в "Программы и компоненты"
5. ✅ Можно удалить стандартным способом

## Тестирование перед распространением

```bash
# 1. Соберите
npm run build

# 2. Запустите локально
npm start

# 3. Проверьте все функции:
#    - Открытие файлов
#    - Терминал
#    - AI панель
#    - Settings

# 4. Если все работает, создайте установщик
npm run package:win

# 5. Установите на чистую систему и протестируйте
```

## Распространение

После создания установщика можете:

1. **Отправить файл** напрямую пользователям
2. **Загрузить на GitHub** Releases
3. **Разместить на сайте** для скачивания
4. **Использовать** для личного использования

## Обновление версии

В `package.json`:
```json
{
  "version": "0.2.0"  ← Измените здесь
}
```

Затем пересоберите:
```bash
npm run package:win
```

Новый установщик будет с новой версией.

## Полезные ссылки

- [Подробная инструкция](BUILD.md)
- [electron-builder документация](https://www.electron.build/)
- [Настройка иконок](https://www.electronjs.org/docs/latest/tutorial/icons)

## 🎉 Итого

Три команды и готово:

```bash
npm install
npm run build
npm run package:win
```

Результат: `release/AI Terminal IDE Setup 0.1.0.exe`

**Устанавливайте и используйте!** 🚀
