import React, { useState } from 'react';
import TestCommunication from './components/TestCommunication';
import FileUpload from './components/FileUpload';
import TestEmbedding from './components/TestEmbedding';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(false);

  const handleFileProcessed = () => {
    setIsChatEnabled(true); // Enable chat after file processing
  };

  return (
    <div>
      <h1>IntelliChat File Assistant</h1>
      <FileUpload onFileProcessed={handleFileProcessed} />
      <ChatInterface isEnabled={isChatEnabled} />
    </div>
  );
};

export default App;
