import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
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
      IntelliChat<span className="pink-text"> File Assistant</span> 
      <p> Ask questions and get key takeaways from your documents with generative AI</p>
      </div>
      <FileUpload onFileProcessed={handleFileProcessed} />
      <ChatInterface isEnabled={isChatEnabled} />
    </div>
  );
};

export default App;
