import React from 'react';
import TestCommunication from './components/TestCommunication';
import FileUpload from './components/FileUpload';
import TestEmbedding from './components/TestEmbedding';

const App: React.FC = () => {
  return (
    <div>
      
      <h1>IntelliChat File Assistant</h1>
      {/* <TestCommunication /> */}
      <FileUpload />
      {/* <TestEmbedding /> */}
    </div>
  );
};

export default App;
