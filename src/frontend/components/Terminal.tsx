import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  projectPath: string;
}

const Terminal: React.FC<TerminalProps> = ({ projectPath }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>('');
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    const ws = new WebSocket('ws://localhost:3001/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'terminal:create',
        cwd: projectPath || process.cwd(),
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'terminal:created':
          sessionIdRef.current = data.sessionId;
          break;
        case 'terminal:output':
          if (data.sessionId === sessionIdRef.current) {
            xterm.write(data.output);
          }
          break;
        case 'error':
          console.error('WebSocket error:', data.error);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      xterm.writeln('\r\n\x1b[31mWebSocket connection error\x1b[0m');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      xterm.writeln('\r\n\x1b[33mTerminal disconnected\x1b[0m');
    };

    xterm.onData((data) => {
      if (ws.readyState === WebSocket.OPEN && sessionIdRef.current) {
        ws.send(JSON.stringify({
          type: 'terminal:input',
          sessionId: sessionIdRef.current,
          input: data,
        }));
      }
    });

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
      ws.close();
    };
  }, [projectPath]);

  return (
    <div style={{ height: '100%', width: '100%', padding: '8px' }}>
      <div 
        ref={terminalRef} 
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default Terminal;
