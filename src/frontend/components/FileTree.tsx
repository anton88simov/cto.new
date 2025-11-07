import React, { useState, useEffect } from 'react';

interface FileTreeProps {
  projectPath: string;
  onFileSelect: (filePath: string) => void;
  activeFile: string;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const FileTree: React.FC<FileTreeProps> = ({ projectPath, onFileSelect, activeFile }) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (projectPath) {
      loadDirectory(projectPath);
    }
  }, [projectPath]);

  const loadDirectory = async (path: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/files?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const files = await response.json();
        setTree(files);
      }
    } catch (error) {
      console.error('Error loading directory:', error);
    }
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expanded.has(node.path);
    const isActive = activeFile === node.path;

    return (
      <div key={node.path}>
        <div
          style={{
            paddingLeft: `${depth * 16 + 8}px`,
            padding: '4px 8px',
            cursor: 'pointer',
            backgroundColor: isActive ? '#094771' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
          }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleExpand(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === 'directory' && (
            <span style={{ marginRight: '4px' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {node.type === 'file' && (
            <span style={{ marginRight: '4px' }}>📄</span>
          )}
          <span>{node.name}</span>
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      backgroundColor: '#252526',
      color: '#cccccc',
    }}>
      <div style={{ 
        padding: '8px', 
        borderBottom: '1px solid #333',
        fontWeight: 'bold',
        fontSize: '12px',
        textTransform: 'uppercase',
      }}>
        Explorer
      </div>
      {tree.length > 0 ? (
        tree.map(node => renderNode(node))
      ) : (
        <div style={{ padding: '8px', color: '#666' }}>
          No project opened
        </div>
      )}
    </div>
  );
};

export default FileTree;
