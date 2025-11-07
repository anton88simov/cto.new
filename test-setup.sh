#!/bin/bash

echo "==================================="
echo "AI Terminal IDE - Setup Test"
echo "==================================="
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✓ Node.js version: $(node --version)"
else
    echo "✗ Node.js not found"
    exit 1
fi

# Check npm
echo ""
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    echo "✓ npm version: $(npm --version)"
else
    echo "✗ npm not found"
    exit 1
fi

# Check dependencies
echo ""
echo "3. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "✓ node_modules exists"
    echo "  Total packages: $(ls node_modules | wc -l)"
else
    echo "✗ node_modules not found - run 'npm install'"
    exit 1
fi

# Check project structure
echo ""
echo "4. Checking project structure..."
dirs=("src/backend" "src/frontend" "src/electron" "docs")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✓ $dir exists"
    else
        echo "✗ $dir missing"
    fi
done

# Check key files
echo ""
echo "5. Checking key files..."
files=(
    "package.json"
    "tsconfig.json"
    "src/backend/index.ts"
    "src/frontend/main.tsx"
    "src/electron/main.ts"
)
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
    fi
done

# Check services
echo ""
echo "6. Checking backend services..."
services=(
    "src/backend/services/ai.service.ts"
    "src/backend/services/terminal.service.ts"
    "src/backend/services/indexer.service.ts"
    "src/backend/services/security.service.ts"
    "src/backend/services/database.service.ts"
    "src/backend/services/file.service.ts"
)
for service in "${services[@]}"; do
    if [ -f "$service" ]; then
        echo "✓ $(basename $service)"
    else
        echo "✗ $(basename $service) missing"
    fi
done

# Check ports
echo ""
echo "7. Checking if ports are available..."
if command -v lsof &> /dev/null; then
    if lsof -i :3001 &> /dev/null; then
        echo "⚠ Port 3001 is already in use"
    else
        echo "✓ Port 3001 is available"
    fi
    
    if lsof -i :5173 &> /dev/null; then
        echo "⚠ Port 5173 is already in use"
    else
        echo "✓ Port 5173 is available"
    fi
else
    echo "⚠ Cannot check ports (lsof not installed)"
fi

echo ""
echo "==================================="
echo "Setup check complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Configure your AI API in .env (copy from .env.example)"
echo "2. Run: npm run dev"
echo "3. Open Settings in the app and configure project path"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
