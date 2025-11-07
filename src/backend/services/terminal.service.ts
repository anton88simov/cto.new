import * as pty from 'node-pty';
import * as os from 'os';

interface TerminalSession {
  id: string;
  pty: pty.IPty;
  cwd: string;
}

export class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();
  private outputCallbacks: Map<string, (output: string) => void> = new Map();

  async createSession(cwd?: string): Promise<TerminalSession> {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const workingDir = cwd || process.cwd();
    const id = this.generateSessionId();

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: workingDir,
      env: process.env as { [key: string]: string },
    });

    const session: TerminalSession = {
      id,
      pty: ptyProcess,
      cwd: workingDir,
    };

    this.sessions.set(id, session);

    ptyProcess.onData((data) => {
      const callback = this.outputCallbacks.get(id);
      if (callback) {
        callback(data);
      }
    });

    ptyProcess.onExit(() => {
      this.sessions.delete(id);
      this.outputCallbacks.delete(id);
    });

    return session;
  }

  handleInput(sessionId: string, input: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pty.write(input);
    } else {
      console.error(`Terminal session ${sessionId} not found`);
    }
  }

  onOutput(sessionId: string, callback: (output: string) => void): void {
    this.outputCallbacks.set(sessionId, callback);
  }

  resize(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pty.resize(cols, rows);
    }
  }

  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pty.kill();
      this.sessions.delete(sessionId);
      this.outputCallbacks.delete(sessionId);
    }
  }

  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  private generateSessionId(): string {
    return `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
