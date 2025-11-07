import express from 'express';
import { Server } from 'ws';
import { setupRoutes } from './routes';
import { TerminalService } from './services/terminal.service';
import { AIService } from './services/ai.service';
import { IndexerService } from './services/indexer.service';
import { SecurityService } from './services/security.service';
import { DatabaseService } from './services/database.service';
import { FileService } from './services/file.service';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

const databaseService = new DatabaseService();
const securityService = new SecurityService();
const aiService = new AIService();
const indexerService = new IndexerService();
const terminalService = new TerminalService();
const fileService = new FileService();

setupRoutes(app, {
  databaseService,
  securityService,
  aiService,
  indexerService,
  terminalService,
  fileService,
});

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

const wss = new Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'terminal:input':
          terminalService.handleInput(data.sessionId, data.input);
          break;
        case 'terminal:create':
          const session = await terminalService.createSession(data.cwd);
          ws.send(JSON.stringify({ type: 'terminal:created', sessionId: session.id }));
          terminalService.onOutput(session.id, (output) => {
            ws.send(JSON.stringify({ type: 'terminal:output', sessionId: session.id, output }));
          });
          break;
        case 'ai:stream':
          aiService.streamCompletion(data.request, (chunk) => {
            ws.send(JSON.stringify({ type: 'ai:chunk', requestId: data.requestId, chunk }));
          });
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', error: String(error) }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
