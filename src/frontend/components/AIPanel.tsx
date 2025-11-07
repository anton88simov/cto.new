import React, { useState, useEffect, useRef } from 'react';

interface AIPanelProps {
  activeFile: string;
  fileContent: string;
  onApplyChanges: (newContent: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIPanel: React.FC<AIPanelProps> = ({ activeFile, fileContent, onApplyChanges }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = activeFile && fileContent ? {
        files: [activeFile],
        activeFileContent: fileContent,
      } : undefined;

      const response = await fetch('http://localhost:3001/api/ai/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
    }}>
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #333',
        backgroundColor: '#252526',
      }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            backgroundColor: activeTab === 'chat' ? '#1e1e1e' : '#252526',
            color: activeTab === 'chat' ? '#fff' : '#888',
            cursor: 'pointer',
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            backgroundColor: activeTab === 'history' ? '#1e1e1e' : '#252526',
            color: activeTab === 'history' ? '#fff' : '#888',
            cursor: 'pointer',
          }}
        >
          📜 History
        </button>
      </div>

      {activeTab === 'chat' && (
        <>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.length === 0 && (
              <div style={{ color: '#666', textAlign: 'center', marginTop: '32px' }}>
                Start a conversation with AI
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: msg.role === 'user' ? '#094771' : '#2d2d30',
                  padding: '12px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  color: '#888', 
                  marginBottom: '4px',
                  fontWeight: 'bold',
                }}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div style={{ color: '#888', textAlign: 'center' }}>
                AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #333',
            backgroundColor: '#252526',
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI anything..."
              style={{
                width: '100%',
                minHeight: '80px',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '8px',
                backgroundColor: '#0e639c',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div style={{ padding: '16px', overflowY: 'auto' }}>
          <div style={{ color: '#666' }}>
            History feature coming soon...
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPanel;
