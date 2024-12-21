import React, { useState } from 'react';
import axios from 'axios';

interface ChatInterfaceProps {
  isEnabled: boolean; // Whether the chat is enabled
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isEnabled }) => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const handleSend = async () => {
    if (!question.trim()) {
      alert('Please type a question.');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setQuestion('');

    try {
      const response = await axios.post('http://localhost:5000/chat', { question });
      const answer = response.data.answer || 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Chat Interface</h1>

      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '10px',
          height: '300px',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              margin: '5px 0',
            }}
          >
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isEnabled ? 'Type your question here...' : 'Upload a file to enable chat'}
          disabled={!isEnabled}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!isEnabled}
          style={{
            padding: '10px 20px',
            backgroundColor: isEnabled ? '#007BFF' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: isEnabled ? 'pointer' : 'not-allowed',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
