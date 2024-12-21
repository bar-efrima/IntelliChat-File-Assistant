import React, { useState } from 'react';
import axios from 'axios';
import Chat from './ChatInterface';

const TestEmbedding: React.FC = () => {
    const [file, setfile] = useState<File | null>(null); 
    const [chunks, setChunks] = useState<string[]>([]);
    const [embedding, setEmbedding] = useState<number[][]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('');


     // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) { // Check if a file is selected
            setfile(event.target.files[0]); 
        }
    };

    // Upload and parse the file
    const handleUpload = async () => {
        if (!file) {
            setStatusMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Upload the file and parse it using the /upload route
        try {
            setStatusMessage('Uploading and parsing file...');
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setChunks(response.data.chunks || []);
            setStatusMessage('File uploaded and parsed successfully.');
        } catch (error) {
            console.error('Error uploading file:', error);
            setStatusMessage('Error uploading and parsing file.');
            }
    };

    const handleGenerateEmbeddings = async () => {
        if (chunks.length === 0) {
            setStatusMessage('No chunks avvailable to generate embeddings.');
            return;
        }
        try {
            setStatusMessage('Generating embedding...');
            // Generate the embedding using the /embed route 
            const response = await axios.post('http://localhost:5000/embed', {
                chunks
            }); 
            setEmbedding(response.data.embeddings || []);
            setStatusMessage('Embedding generated successfully.');

        } catch (error) {
            console.error('Error generating embedding:', error);
            setStatusMessage('Error generating embedding.');
        }
    };

    return (
        <div >
      <h1>Test Embeddings Page</h1>

      {/* File Upload Section */}
      <div>
        <h2>1. Upload a File</h2>
        <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
        <button onClick={handleUpload}>Upload and Parse</button>
        <p>{statusMessage}</p>
      </div>

      {/* Chunks Display */}
      {chunks.length > 0 && (
        <div>
          <h2>2. Parsed Chunks</h2>
          <ul>
            {chunks.map((chunk, index) => (
              <li key={index}>{chunk}</li>
            ))}
          </ul>
          <button onClick={handleGenerateEmbeddings}>Generate Embeddings</button>
        </div>
      )}

      {/* Embeddings Display */}
      {embedding.length > 0 && (
        <div>
          <h2>3. Generated Embeddings</h2>
          <ul>
            {embedding.map((embedding, index) => (
              <li key={index}>
                Chunk {index + 1}: {embedding.slice(0, 5).join(', ')}...
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* {embedding.length > 0 && (
    <Chat embeddings={embedding} chunks={chunks} />
    )} */}

    </div>
  );
};
  

export default TestEmbedding;
