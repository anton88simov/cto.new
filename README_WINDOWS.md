# AI Terminal IDE - Windows Installation

## 🎯 Quick Start

### For Developers (Building from source)

```bash
# 1. Install dependencies
npm install

# 2. Build everything
npm run build

# 3. Create installer
npm run package:win
```

**Result**: `release/AI Terminal IDE Setup 0.1.0.exe`

### For End Users (Using installer)

1. Download `AI Terminal IDE Setup 0.1.0.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch from desktop shortcut

## 📦 What's Included

- **Monaco Editor** - Code editing (like VS Code)
- **Integrated Terminal** - Full bash/powershell support
- **AI Assistant** - Chat with AI for code help
- **File Explorer** - Project navigation
- **Backend Server** - Runs automatically on port 3001

## ⚙️ First Run Setup

1. Click **Settings** (⚙️) button
2. Configure:
   - **Project Path**: Path to your project
   - **AI API URL**: Your AI API endpoint
   - **API Key**: Your API key
   - **Model**: AI model name
3. Click **Save**

## 🎮 Using the IDE

### File Editing
- Click any file in the tree to open
- Edit code in the center panel
- Changes auto-save

### Terminal
- Terminal is at the bottom
- Run any command: `npm install`, `git status`, etc.
- Full command history support

### AI Assistant
- Right panel for AI chat
- Ask questions about your code
- Generate components
- Fix bugs
- Refactor code

## 🐛 Troubleshooting

### Port 3001 is already in use

```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

### Application won't start

- Check antivirus (may block)
- Run as administrator
- Check if port 3001 is free
- View logs in `%APPDATA%\AI Terminal IDE\logs`

### Backend not responding

- Restart the application
- Check firewall settings
- Ensure Node.js modules are installed

## 📊 System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk**: 500 MB free space
- **Port**: 3001 must be available

## 🔧 Building for Other Platforms

```bash
# macOS
npm run package:mac

# Linux
npm run package:linux

# All platforms
npm run package
```

## 📚 Documentation

- [Full Documentation](README.md)
- [Build Guide](BUILD.md)
- [Quick Start (Russian)](ЗАПУСК.md)
- [Build Instructions (Russian)](СБОРКА_EXE.md)

## 🎉 Features

✅ Full IDE experience like Cursor
✅ Integrated terminal with PTY support
✅ AI-powered code assistance
✅ Monaco editor (VS Code engine)
✅ Auto-completion and syntax highlighting
✅ Multi-cursor editing
✅ Project file tree
✅ Command history
✅ SQLite database for history
✅ WebSocket for real-time communication

## 📝 License

MIT

---

**Enjoy coding with AI Terminal IDE!** 🚀
