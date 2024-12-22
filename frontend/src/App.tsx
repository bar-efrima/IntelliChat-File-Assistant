import React, { useState } from 'react';
import TestCommunication from './components/TestCommunication';
import FileUpload from './components/FileUpload';
import TestEmbedding from './components/TestEmbedding';
import ChatInterface from './components/ChatInterface';
import './App.css';

const App: React.FC = () => {
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(false);

  const handleFileProcessed = () => {
    setIsChatEnabled(true); // Enable chat after file processing
  };

  return (
    <div>
      <div className="file-assistant-title">
      <p>IntelliChat File Assistant</p>
      </div>
      <FileUpload onFileProcessed={handleFileProcessed} />
      <ChatInterface isEnabled={isChatEnabled} />
    </div>
  );
};

export default App;
