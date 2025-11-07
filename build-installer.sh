#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  AI Terminal IDE - Сборка установщика"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Проверка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки зависимостей"
        exit 1
    fi
fi

# Проверка electron-builder
if ! npm list electron-builder &> /dev/null; then
    echo "📦 Устанавливаем electron-builder..."
    npm install --save-dev electron-builder
fi

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "Шаг 1/4: Сборка Backend"
echo "───────────────────────────────────────────────────────────────"
npm run build:backend
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки backend"
    exit 1
fi
echo "✅ Backend собран → dist/backend/"

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "Шаг 2/4: Сборка Frontend"
echo "───────────────────────────────────────────────────────────────"
npm run build:frontend
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки frontend"
    exit 1
fi
echo "✅ Frontend собран → dist/frontend/"

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "Шаг 3/4: Сборка Electron"
echo "───────────────────────────────────────────────────────────────"
npm run build:electron
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки electron"
    exit 1
fi
echo "✅ Electron собран → dist/electron/"

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "Шаг 4/4: Создание установщика"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Выберите платформу:"
echo "1) Windows (.exe)"
echo "2) macOS (.dmg)"
echo "3) Linux (.AppImage + .deb)"
echo "4) Все платформы"
echo ""
read -p "Ваш выбор (1-4): " choice

case $choice in
    1)
        echo "🔨 Сборка для Windows..."
        npm run package:win
        ;;
    2)
        echo "🔨 Сборка для macOS..."
        npm run package:mac
        ;;
    3)
        echo "🔨 Сборка для Linux..."
        npm run package:linux
        ;;
    4)
        echo "🔨 Сборка для всех платформ..."
        npm run package
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

if [ $? -ne 0 ]; then
    echo "❌ Ошибка создания установщика"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ СБОРКА ЗАВЕРШЕНА УСПЕШНО!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Установщик находится в папке: release/"
echo ""
ls -lh release/ 2>/dev/null | grep -E '\.(exe|dmg|AppImage|deb)$' || echo "Файлы собираются..."
echo ""
echo "Для установки:"
echo "- Windows: Запустите .exe файл"
echo "- macOS: Откройте .dmg файл"
echo "- Linux: Запустите .AppImage или установите .deb"
echo ""
echo "═══════════════════════════════════════════════════════════════"
