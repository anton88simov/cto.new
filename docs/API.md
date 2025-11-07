# API Documentation

## Backend API Endpoints

Base URL: `http://localhost:3001`

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### AI Completion

Generate AI completions with optional context from files.

```
POST /api/ai/completion
```

Request Body:
```json
{
  "prompt": "Your question or instruction",
  "model": "gpt-3.5-turbo",
  "temperature": 0.2,
  "maxTokens": 1024,
  "context": {
    "files": ["/path/to/file1.js", "/path/to/file2.js"]
  }
}
```

Response:
```json
{
  "text": "AI response text",
  "tokens": 150,
  "model": "gpt-3.5-turbo"
}
```

---

### Index Project

Index a project directory for better AI context.

```
POST /api/indexer/index
```

Request Body:
```json
{
  "projectPath": "/path/to/project"
}
```

Response:
```json
{
  "success": true
}
```

---

### Search Code

Search indexed code by query.

```
GET /api/indexer/search?query=searchTerm&projectPath=/path/to/project
```

Response:
```json
[
  {
    "file": "/path/to/file.js",
    "matches": ["functions", "classes"],
    "score": 15
  }
]
```

---

### Validate Command

Check if a shell command is safe to execute.

```
POST /api/security/validate-command
```

Request Body:
```json
{
  "command": "rm -rf /"
}
```

Response:
```json
{
  "allowed": false,
  "risk": "high",
  "reason": "Command contains dangerous pattern: rm -rf",
  "requiresConfirmation": true
}
```

---

### Get History

Retrieve AI interaction history.

```
GET /api/history?limit=50&offset=0
```

Response:
```json
[
  {
    "id": 1,
    "prompt": "User prompt",
    "response": "AI response",
    "model": "gpt-3.5-turbo",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Save Settings

Save user settings.

```
POST /api/settings
```

Request Body:
```json
{
  "aiApiUrl": "http://localhost:8000",
  "aiApiKey": "your-key",
  "defaultModel": "gpt-3.5-turbo",
  "temperature": 0.2,
  "maxTokens": 1024
}
```

Response:
```json
{
  "success": true
}
```

---

### Get Settings

Retrieve user settings.

```
GET /api/settings
```

Response:
```json
{
  "aiApiUrl": "http://localhost:8000",
  "aiApiKey": "***encrypted***",
  "defaultModel": "gpt-3.5-turbo",
  "temperature": 0.2,
  "maxTokens": 1024
}
```

---

### List Files

Get directory tree structure.

```
GET /api/files?path=/path/to/directory
```

Response:
```json
[
  {
    "name": "src",
    "path": "/path/to/directory/src",
    "type": "directory",
    "children": [...]
  },
  {
    "name": "index.js",
    "path": "/path/to/directory/index.js",
    "type": "file"
  }
]
```

---

### Read File

Read file content.

```
GET /api/file?path=/path/to/file.js
```

Response: File content as text

---

### Write File

Write content to file.

```
POST /api/file
```

Request Body:
```json
{
  "path": "/path/to/file.js",
  "content": "file content"
}
```

Response:
```json
{
  "success": true
}
```

---

### Delete File

Delete a file.

```
DELETE /api/file?path=/path/to/file.js
```

Response:
```json
{
  "success": true
}
```

---

## WebSocket API

WebSocket URL: `ws://localhost:3001/ws`

### Terminal Operations

#### Create Terminal Session

```json
{
  "type": "terminal:create",
  "cwd": "/path/to/working/directory"
}
```

Response:
```json
{
  "type": "terminal:created",
  "sessionId": "term-12345"
}
```

#### Send Terminal Input

```json
{
  "type": "terminal:input",
  "sessionId": "term-12345",
  "input": "ls -la\n"
}
```

#### Terminal Output (Server → Client)

```json
{
  "type": "terminal:output",
  "sessionId": "term-12345",
  "output": "command output"
}
```

### AI Streaming

#### Stream AI Response

```json
{
  "type": "ai:stream",
  "requestId": "req-12345",
  "request": {
    "prompt": "Your question",
    "model": "gpt-3.5-turbo"
  }
}
```

#### AI Chunk (Server → Client)

```json
{
  "type": "ai:chunk",
  "requestId": "req-12345",
  "chunk": "partial response text"
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `400` - Bad Request (missing parameters)
- `500` - Internal Server Error
- `200` - Success
