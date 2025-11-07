# Architecture Documentation

## System Overview

AI Terminal IDE is a desktop application built with Electron that combines a code editor, integrated terminal, and AI assistance into a unified development environment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Frontend (React + TypeScript)          │  │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │   Monaco   │  │  xterm   │  │  React UI    │  │  │
│  │  │   Editor   │  │ Terminal │  │  Components  │  │  │
│  │  └────────────┘  └──────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                     HTTP + WebSocket
                          │
┌─────────────────────────────────────────────────────────┐
│              Backend Server (Node.js)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   Services                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │    AI    │  │ Terminal │  │   Indexer    │   │  │
│  │  │ Service  │  │ Service  │  │   Service    │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │ Security │  │ Database │  │     File     │   │  │
│  │  │ Service  │  │ Service  │  │   Service    │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
            │                           │
      ┌─────┴─────┐                ┌────┴────┐
      │           │                │         │
┌─────▼────┐  ┌───▼────┐      ┌────▼────┐  │
│ AI API   │  │ SQLite │      │  Shell  │  │
│ (Private)│  │   DB   │      │ (PTY)   │  │
└──────────┘  └────────┘      └─────────┘  │
                                            │
                                    ┌───────▼────────┐
                                    │  File System   │
                                    └────────────────┘
```

## Components

### 1. Frontend Layer

#### Monaco Editor
- **Purpose**: Code editing with syntax highlighting
- **Features**: 
  - Multi-language support
  - IntelliSense
  - VS Code keybindings
  - Diff viewer
- **Integration**: Communicates with backend for file operations

#### xterm.js Terminal
- **Purpose**: Terminal emulation in browser
- **Features**:
  - Full ANSI color support
  - Resize handling
  - Copy/paste support
- **Integration**: WebSocket connection to backend PTY

#### React Components
- **FileTree**: Project file navigation
- **AIPanel**: Chat interface with AI
- **SettingsPanel**: Configuration UI
- **Editor**: Monaco editor wrapper
- **Terminal**: xterm.js wrapper

### 2. Backend Layer

#### AI Service
```typescript
class AIService {
  getCompletion(request): Promise<AIResponse>
  streamCompletion(request, onChunk): Promise<void>
  analyzeCode(code, language): Promise<string>
  generateCode(description, language): Promise<string>
  refactorCode(code, instruction): Promise<string>
  fixBug(code, error): Promise<string>
}
```

**Responsibilities**:
- Communicate with private AI API
- Handle streaming responses
- Format prompts with context
- Manage API credentials

#### Terminal Service
```typescript
class TerminalService {
  createSession(cwd): Promise<TerminalSession>
  handleInput(sessionId, input): void
  onOutput(sessionId, callback): void
  resize(sessionId, cols, rows): void
  closeSession(sessionId): void
}
```

**Responsibilities**:
- Spawn PTY processes
- Manage terminal sessions
- Handle I/O between frontend and shell
- Support multiple terminals

#### Indexer Service
```typescript
class IndexerService {
  indexProject(projectPath): Promise<void>
  search(query, projectPath): Promise<SearchResult[]>
  getFilesContext(files): Promise<string>
  getFileIndex(filePath): FileIndex | undefined
}
```

**Responsibilities**:
- Parse source code (AST analysis)
- Extract functions, classes, exports
- Build searchable index
- Provide context for AI queries

#### Security Service
```typescript
class SecurityService {
  validateCommand(command): CommandValidation
  sanitizeOutput(output): string
  encryptApiKey(apiKey): string
  decryptApiKey(encryptedKey): string
  shouldFilterFile(filePath): boolean
}
```

**Responsibilities**:
- Validate shell commands for safety
- Detect dangerous operations
- Filter secrets from output
- Manage API key encryption

#### Database Service
```typescript
class DatabaseService {
  saveAIRequest(request): Promise<number>
  getHistory(limit, offset): Promise<AIRequestRecord[]>
  saveSettings(settings): Promise<void>
  getSettings(): Promise<Settings>
}
```

**Responsibilities**:
- Store AI interaction history
- Persist user settings
- Manage SQLite database
- Handle migrations

#### File Service
```typescript
class FileService {
  readDirectory(dirPath): Promise<FileNode[]>
  readFile(filePath): Promise<string>
  writeFile(filePath, content): Promise<void>
  deleteFile(filePath): Promise<void>
}
```

**Responsibilities**:
- File system operations
- Directory traversal
- Ignore patterns (node_modules, .git)
- File type detection

## Data Flow

### Code Editing Flow
```
1. User opens file in FileTree
2. Frontend → GET /api/file?path=...
3. Backend FileService reads file
4. Content sent to Frontend
5. Monaco Editor displays content
6. User edits
7. Auto-save or manual save
8. Frontend → POST /api/file
9. Backend writes to file system
```

### AI Interaction Flow
```
1. User types prompt in AIPanel
2. Frontend gathers context (active file, etc.)
3. Frontend → POST /api/ai/completion
4. Backend AIService:
   - Gets file context from IndexerService
   - Builds full prompt
   - Calls private AI API
   - Saves to DatabaseService
5. Response → Frontend
6. Display in AIPanel
```

### Terminal Flow
```
1. Frontend establishes WebSocket connection
2. Frontend → { type: "terminal:create" }
3. Backend TerminalService:
   - Spawns PTY process
   - Returns session ID
4. User types in terminal
5. Frontend → { type: "terminal:input" }
6. Backend writes to PTY
7. PTY output → Backend
8. Backend → { type: "terminal:output" }
9. Frontend xterm displays output
```

## Security Model

### Command Validation
1. All shell commands pass through SecurityService
2. Pattern matching against dangerous commands
3. Risk levels: low, medium, high
4. User confirmation for risky commands

### Secret Management
1. API keys encrypted before storage
2. Output sanitization removes secrets
3. Files with secrets excluded from AI context
4. Environment variables not exposed

### File Access
1. Path validation prevents directory traversal
2. Whitelist of allowed directories
3. Ignore sensitive files (.env, .pem, etc.)

## Performance Optimizations

### Indexer
- Incremental indexing on file changes
- In-memory cache for frequent lookups
- Ignore large binary files

### Terminal
- Chunked output handling
- Buffer management for long outputs
- Efficient WebSocket usage

### AI
- Streaming for long responses
- Context size limiting
- Request debouncing

## Extensibility Points

### Custom Prompts
Add templates in `prompt-templates/`:
```typescript
{
  name: "Component Generator",
  template: "Generate React component...",
  variables: ["componentName", "props"]
}
```

### Language Support
Add parsers in IndexerService:
```typescript
extractFunctions(content, language) {
  switch(language) {
    case 'python':
      return this.extractPythonFunctions(content);
    // Add more languages
  }
}
```

### AI Providers
Implement AIProvider interface:
```typescript
interface AIProvider {
  getCompletion(request): Promise<AIResponse>
  streamCompletion(request, onChunk): Promise<void>
}
```

## Database Schema

### ai_requests
```sql
CREATE TABLE ai_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  timestamp TEXT NOT NULL
)
```

### settings
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)
```

### sessions (future)
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

## Technology Choices

### Why Electron?
- Cross-platform desktop app
- Access to Node.js APIs
- Native system integration
- Large ecosystem

### Why Monaco Editor?
- Production-ready (VS Code uses it)
- Excellent TypeScript support
- Rich API
- Active maintenance

### Why node-pty?
- True PTY support
- Better than exec/spawn for interactive shells
- Proper terminal emulation

### Why SQLite?
- Embedded database
- No server required
- Fast for local data
- ACID compliance

## Future Enhancements

1. **Multi-file editing**: Tab management, split views
2. **Git integration**: Commit, diff, branch operations
3. **Debugging support**: Breakpoints, step through
4. **Extension system**: Plugin architecture
5. **Collaborative features**: Remote pairing
6. **Cloud sync**: Settings and history
7. **Mobile companion**: View code on mobile
8. **Voice input**: Natural language coding
