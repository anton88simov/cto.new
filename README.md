# AI Terminal IDE

AI-powered Terminal IDE with private API integration - a comprehensive development environment with integrated terminal and deep AI integration for web coding assistance.

## Features

- 🎨 **Code Editor** - Monaco Editor with syntax highlighting for multiple languages
- 💻 **Integrated Terminal** - Full-featured terminal with xterm.js and node-pty
- 🤖 **AI Integration** - Connect to your private AI API for code assistance
- 📁 **File Explorer** - Project tree navigation with file operations
- 🔍 **Project Indexer** - AST-based code indexing for better context
- 🔒 **Security** - Command validation, API key encryption, output sanitization
- 📊 **History** - Track all AI interactions with rollback capability
- ⚙️ **Configurable** - Customize AI models, parameters, and settings

## Architecture

### Frontend (React + TypeScript + Electron)
- Monaco Editor for code editing
- xterm.js for terminal emulation
- React-based UI components

### Backend (Node.js + Express)
- Local server for file operations and AI integration
- WebSocket support for real-time terminal and AI streaming
- SQLite database for history and settings

### Services
- **AIService** - Integration with private AI API
- **TerminalService** - Terminal session management with node-pty
- **IndexerService** - Project code indexing and search
- **SecurityService** - Command validation and secret filtering
- **DatabaseService** - Persistent storage for history and settings
- **FileService** - File system operations

## Installation

```bash
npm install
```

## Configuration

Before running the application, configure your AI API settings:

1. Open the application
2. Click on ⚙️ Settings
3. Configure:
   - **Project Path**: Path to your project directory
   - **AI API URL**: Your private AI API endpoint (e.g., `http://localhost:8000`)
   - **API Key**: Your API authentication key
   - **Default Model**: AI model name (e.g., `gpt-3.5-turbo`)
   - **Temperature**: AI response creativity (0-2)
   - **Max Tokens**: Maximum response length

## Development

Start all services in development mode:

```bash
npm run dev
```

This will start:
- Frontend dev server on `http://localhost:5173`
- Backend server on `http://localhost:3001`
- Electron application

### Individual Services

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Electron only (requires frontend to be running)
npm run dev:electron
```

## Build

```bash
npm run build
```

This builds:
- Frontend to `dist/frontend`
- Backend to `dist/backend`
- Electron to `dist/electron`

## Running Production Build

```bash
npm start
```

## AI API Integration

### Expected API Format

Your AI API should accept requests in this format:

```json
POST /v1/ai/completions
Headers: Authorization: Bearer <API_KEY>
Body:
{
  "model": "your-model-name",
  "prompt": "your prompt with context",
  "max_tokens": 1024,
  "temperature": 0.2,
  "stream": false
}
```

Response:
```json
{
  "text": "AI response text",
  "tokens": 150,
  "model": "model-name"
}
```

### Streaming Support

For streaming responses, set `"stream": true` and the API should return Server-Sent Events:

```
data: {"choices": [{"text": "chunk of text"}]}
data: [DONE]
```

## Features in Detail

### Code Editor
- Multi-language syntax highlighting
- IntelliSense and auto-completion
- Multi-cursor support
- VS Code-compatible keybindings

### Integrated Terminal
- Full TTY support (bash/zsh/powershell)
- Command history
- Output sanitization for secrets
- Dangerous command detection

### AI Capabilities
- Code generation
- Refactoring assistance
- Bug fixing suggestions
- Code analysis
- Context-aware completions
- Multi-file operations

### Project Indexer
- AST-based code parsing
- Function and class extraction
- Import/export tracking
- Fast search and context retrieval
- Automatic re-indexing on changes

### Security Features
- Command validation (dangerous command detection)
- API key encryption
- Output sanitization (removes secrets from logs)
- File path validation
- Configurable file filters

## Project Structure

```
ai-terminal-ide/
├── src/
│   ├── backend/           # Node.js backend
│   │   ├── services/      # Core services
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Backend entry point
│   ├── electron/          # Electron main process
│   │   └── main.ts        # Electron entry point
│   └── frontend/          # React frontend
│       ├── components/    # UI components
│       ├── styles/        # CSS styles
│       ├── App.tsx        # Main app component
│       └── main.tsx       # Frontend entry point
├── data/                  # Database and local storage
├── dist/                  # Build output
├── package.json
└── README.md
```

## User Scenarios

### Generate Component
```
Ask AI: "Create a React component UserCard with props name, avatarUrl and Jest test"
→ AI generates files, editor opens them
```

### Refactor Code
```
Ask AI: "Rename get_user to fetchUser across the project"
→ AI suggests changes, you confirm, changes applied
```

### Fix Bugs
```
Ask AI: "Find the cause of the failing test in userService.test.js"
→ AI analyzes relevant files, returns fix
```

### Terminal Commands
```
Ask AI: "Build the project and analyze errors"
→ Terminal executes commands, AI analyzes output and suggests fixes
```

## Troubleshooting

### Terminal not connecting
- Ensure backend server is running on port 3001
- Check WebSocket connection in browser console

### AI not responding
- Verify AI API URL and key in settings
- Check backend logs for API errors
- Ensure your AI API is accessible

### Files not loading
- Verify project path in settings
- Check file permissions
- Review backend logs for file system errors

## Tech Stack

- **Frontend**: React, TypeScript, Monaco Editor, xterm.js
- **Backend**: Node.js, Express, WebSocket
- **Desktop**: Electron
- **Terminal**: node-pty
- **Database**: better-sqlite3
- **Build**: Vite, TypeScript

## License

MIT

## Contributing

This is a personal project optimized for individual workflows. Feel free to fork and customize for your needs.
