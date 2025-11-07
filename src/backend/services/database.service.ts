import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

interface AIRequestRecord {
  id?: number;
  prompt: string;
  response: string;
  model: string;
  timestamp: Date;
}

interface Settings {
  aiApiUrl?: string;
  aiApiKey?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'ai-terminal-ide.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        model TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_ai_requests_timestamp 
      ON ai_requests(timestamp DESC)
    `);
  }

  async saveAIRequest(request: AIRequestRecord): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO ai_requests (prompt, response, model, timestamp)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      request.prompt,
      request.response,
      request.model,
      request.timestamp.toISOString()
    );

    return result.lastInsertRowid as number;
  }

  async getHistory(limit: number = 50, offset: number = 0): Promise<AIRequestRecord[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM ai_requests
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset) as any[];

    return rows.map(row => ({
      id: row.id,
      prompt: row.prompt,
      response: row.response,
      model: row.model,
      timestamp: new Date(row.timestamp),
    }));
  }

  async getRequestById(id: number): Promise<AIRequestRecord | null> {
    const stmt = this.db.prepare('SELECT * FROM ai_requests WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      prompt: row.prompt,
      response: row.response,
      model: row.model,
      timestamp: new Date(row.timestamp),
    };
  }

  async saveSettings(settings: Settings): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value)
      VALUES (?, ?)
    `);

    for (const [key, value] of Object.entries(settings)) {
      stmt.run(key, JSON.stringify(value));
    }
  }

  async getSettings(): Promise<Settings> {
    const stmt = this.db.prepare('SELECT * FROM settings');
    const rows = stmt.all() as any[];

    const settings: Settings = {};
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    }

    return settings;
  }

  async getSetting(key: string): Promise<any> {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as any;

    if (!row) return null;

    try {
      return JSON.parse(row.value);
    } catch (e) {
      return row.value;
    }
  }

  async clearHistory(): Promise<void> {
    this.db.exec('DELETE FROM ai_requests');
  }

  close(): void {
    this.db.close();
  }
}
