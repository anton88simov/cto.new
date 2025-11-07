import React, { useState, useEffect } from 'react';

interface SettingsPanelProps {
  onClose: () => void;
  onProjectPathChange: (path: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onProjectPathChange }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [defaultModel, setDefaultModel] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [projectPath, setProjectPath] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setApiUrl(settings.aiApiUrl || '');
        setApiKey(settings.aiApiKey || '');
        setDefaultModel(settings.defaultModel || '');
        setTemperature(settings.temperature || 0.2);
        setMaxTokens(settings.maxTokens || 1024);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    const savedPath = localStorage.getItem('projectPath');
    if (savedPath) {
      setProjectPath(savedPath);
    }
  };

  const handleSave = async () => {
    try {
      const settings = {
        aiApiUrl: apiUrl,
        aiApiKey: apiKey,
        defaultModel,
        temperature,
        maxTokens,
      };

      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        if (projectPath) {
          onProjectPathChange(projectPath);
        }
        alert('Settings saved successfully!');
        onClose();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Error saving settings: ${error}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: '24px',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Project Path
          </label>
          <input
            type="text"
            value={projectPath}
            onChange={(e) => setProjectPath(e.target.value)}
            placeholder="/path/to/your/project"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2d2d30',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            AI API URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2d2d30',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your API key"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2d2d30',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Default Model
          </label>
          <input
            type="text"
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            placeholder="gpt-3.5-turbo"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2d2d30',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Temperature: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Max Tokens
          </label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2d2d30',
              color: '#d4d4d4',
              border: '1px solid #3e3e42',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3e3e42',
              color: '#d4d4d4',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0e639c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
