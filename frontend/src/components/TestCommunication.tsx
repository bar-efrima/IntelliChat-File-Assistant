import React, { useState } from 'react';
import axios from 'axios';

const TestCommunication: React.FC = () => {
  const [response, setResponse] = useState<string>('');

  const testBackendConnection = async () => {
    try {
      const res = await axios.get('http://localhost:5000/test');
      setResponse(res.data.message);
    } catch (error) {
      console.error('Error communicating with backend:', error);
      setResponse('Failed to connect to backend.');
    }
  };

  return (
    <div>
      <h2>Test Backend Communication</h2>
      <button onClick={testBackendConnection}>Test Connection</button>
      <p>{response}</p>
    </div>
  );
};

export default TestCommunication;
