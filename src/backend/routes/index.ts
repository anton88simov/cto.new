import { Express } from 'express';
import { AIService } from '../services/ai.service';
import { IndexerService } from '../services/indexer.service';
import { SecurityService } from '../services/security.service';
import { DatabaseService } from '../services/database.service';
import { TerminalService } from '../services/terminal.service';
import { FileService } from '../services/file.service';

interface Services {
  aiService: AIService;
  indexerService: IndexerService;
  securityService: SecurityService;
  databaseService: DatabaseService;
  terminalService: TerminalService;
  fileService: FileService;
}

export function setupRoutes(app: Express, services: Services) {
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/ai/completion', async (req, res) => {
    try {
      const { prompt, model, temperature, maxTokens, context } = req.body;
      
      let contextData = '';
      if (context?.files) {
        contextData = await services.indexerService.getFilesContext(context.files);
      }
      
      const fullPrompt = contextData ? `${contextData}\n\n${prompt}` : prompt;
      
      const result = await services.aiService.getCompletion({
        prompt: fullPrompt,
        model,
        temperature,
        maxTokens,
      });

      await services.databaseService.saveAIRequest({
        prompt: fullPrompt,
        response: result.text,
        model,
        timestamp: new Date(),
      });

      res.json(result);
    } catch (error) {
      console.error('AI completion error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/indexer/index', async (req, res) => {
    try {
      const { projectPath } = req.body;
      await services.indexerService.indexProject(projectPath);
      res.json({ success: true });
    } catch (error) {
      console.error('Indexer error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get('/api/indexer/search', async (req, res) => {
    try {
      const { query, projectPath } = req.query;
      const results = await services.indexerService.search(query as string, projectPath as string);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/security/validate-command', async (req, res) => {
    try {
      const { command } = req.body;
      const validation = services.securityService.validateCommand(command);
      res.json(validation);
    } catch (error) {
      console.error('Security validation error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get('/api/history', async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const history = await services.databaseService.getHistory(
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0
      );
      res.json(history);
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const settings = req.body;
      await services.databaseService.saveSettings(settings);
      res.json({ success: true });
    } catch (error) {
      console.error('Settings save error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await services.databaseService.getSettings();
      res.json(settings);
    } catch (error) {
      console.error('Settings get error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get('/api/files', async (req, res) => {
    try {
      const { path } = req.query;
      if (!path) {
        return res.status(400).json({ error: 'Path parameter is required' });
      }
      const files = await services.fileService.readDirectory(path as string);
      res.json(files);
    } catch (error) {
      console.error('Files list error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get('/api/file', async (req, res) => {
    try {
      const { path } = req.query;
      if (!path) {
        return res.status(400).json({ error: 'Path parameter is required' });
      }
      const content = await services.fileService.readFile(path as string);
      res.send(content);
    } catch (error) {
      console.error('File read error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/api/file', async (req, res) => {
    try {
      const { path, content } = req.body;
      if (!path || content === undefined) {
        return res.status(400).json({ error: 'Path and content are required' });
      }
      await services.fileService.writeFile(path, content);
      res.json({ success: true });
    } catch (error) {
      console.error('File write error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.delete('/api/file', async (req, res) => {
    try {
      const { path } = req.query;
      if (!path) {
        return res.status(400).json({ error: 'Path parameter is required' });
      }
      await services.fileService.deleteFile(path as string);
      res.json({ success: true });
    } catch (error) {
      console.error('File delete error:', error);
      res.status(500).json({ error: String(error) });
    }
  });
}
