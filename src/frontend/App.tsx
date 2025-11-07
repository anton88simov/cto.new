import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import FileTree from './components/FileTree';
import AIPanel from './components/AIPanel';
import SettingsPanel from './components/SettingsPanel';
import './styles/App.css';

const App: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [projectPath, setProjectPath] = useState<string>('');

  useEffect(() => {
    const savedPath = localStorage.getItem('projectPath');
    if (savedPath) {
      setProjectPath(savedPath);
    }
  }, []);

  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
  };

  const handleContentChange = (content: string) => {
    setFileContent(content);
  };

  const handleProjectPathChange = (path: string) => {
    setProjectPath(path);
    localStorage.setItem('projectPath', path);
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-title">AI Terminal IDE</div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(!showSettings)}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onProjectPathChange={handleProjectPathChange}
        />
      )}

      <div className="main-content">
        <div className="sidebar">
          <FileTree
            projectPath={projectPath}
            onFileSelect={handleFileSelect}
            activeFile={activeFile}
          />
        </div>

        <div className="editor-container">
          <div className="editor-section">
            <Editor
              file={activeFile}
              content={fileContent}
              onChange={handleContentChange}
            />
          </div>

          <div className="terminal-section">
            <Terminal projectPath={projectPath} />
          </div>
        </div>

        <div className="right-panel">
          <AIPanel
            activeFile={activeFile}
            fileContent={fileContent}
            onApplyChanges={(newContent) => setFileContent(newContent)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
