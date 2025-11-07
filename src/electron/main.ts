import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

function startBackend() {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('Backend will be started separately in development mode');
    return;
  }

  try {
    const backendPath = app.isPackaged
      ? path.join(process.resourcesPath, 'backend', 'index.js')
      : path.join(__dirname, '../backend/index.js');

    console.log('Starting backend from:', backendPath);

    backendProcess = fork(backendPath, [], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3001',
      },
      stdio: 'pipe',
    });

    if (backendProcess.stdout) {
      backendProcess.stdout.on('data', (data) => {
        console.log('[Backend]:', data.toString());
      });
    }

    if (backendProcess.stderr) {
      backendProcess.stderr.on('data', (data) => {
        console.error('[Backend Error]:', data.toString());
      });
    }

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
    });

    backendProcess.on('exit', (code) => {
      console.log('Backend process exited with code:', code);
      backendProcess = null;
    });

    console.log('Backend started with PID:', backendProcess.pid);
  } catch (error) {
    console.error('Error starting backend:', error);
  }
}

function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend process...');
    backendProcess.kill();
    backendProcess = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'AI Terminal IDE',
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
    icon: path.join(__dirname, '../../build/icon.png'),
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', () => {
    console.error('Failed to load window content');
  });
}

async function initialize() {
  await app.whenReady();
  
  startBackend();
  
  setTimeout(() => {
    createWindow();
  }, 2000);
}

initialize();

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

app.on('will-quit', () => {
  stopBackend();
});

process.on('SIGTERM', () => {
  stopBackend();
  app.quit();
});

process.on('SIGINT', () => {
  stopBackend();
  app.quit();
});
