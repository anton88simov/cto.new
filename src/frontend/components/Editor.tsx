import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  file: string;
  content: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ file, content, onChange }) => {
  const [localContent, setLocalContent] = useState(content);
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    if (file) {
      loadFile(file);
    }
  }, [file]);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const loadFile = async (filePath: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/file?path=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.text();
        setLocalContent(data);
        setLanguage(detectLanguage(filePath));
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const detectLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || '';
    setLocalContent(newContent);
    onChange(newContent);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {file ? (
        <>
          <div style={{ padding: '8px', borderBottom: '1px solid #333', background: '#1e1e1e' }}>
            <span style={{ color: '#ccc', fontSize: '14px' }}>{file}</span>
          </div>
          <MonacoEditor
            height="calc(100% - 40px)"
            language={language}
            theme="vs-dark"
            value={localContent}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666'
        }}>
          Select a file to edit
        </div>
      )}
    </div>
  );
};

export default Editor;
