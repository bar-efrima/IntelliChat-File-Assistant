import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ChatInterface.css'; 

interface ChatInterfaceProps {
  isEnabled: boolean; // Whether the chat is enabled
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isEnabled }) => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const handleSend = async () => {
    if (!question.trim()) { // Check if the question is empty or only contains whitespace
      alert('Please type a question.');
      return;
    }

    setMessages((prevMessages) => {
      return prevMessages.concat({ role: 'user', content: question });
    });

    setQuestion(''); // Clear the input box

    try {
      const response = await axios.post('http://localhost:5000/chat', { question });
      const answer = response.data.answer || 'No response received.';
      setMessages((prevMessages) => {
        return prevMessages.concat({ role: 'assistant', content: answer });
      });
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages((prevMessages) => 
        prevMessages.concat({ role: 'assistant', content: 'Sorry, something went wrong.' })
      );
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`} 
          >
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content} 
          </div>
        ))}
      </div>

      <div className="chat-controls">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isEnabled ? 'Type your question here...' : 'Upload a file to enable chat'}
          disabled={!isEnabled}
          className="chat-input"
        />
        <button
          onClick={handleSend}
          disabled={!isEnabled}
          className={`chat-button ${!isEnabled ? 'disabled' : ''}`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
