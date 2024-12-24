import React, { useState } from 'react';
import axios from 'axios';
import '../styles/FileUpload.css'; 

interface FileUploadProps {
  onFileProcessed: () => void; // Callback to notify parent when the file is processed
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle file selection 
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setIsLoading(true); // Show loading state
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadMessage(response.data.message);
      onFileProcessed(); // Notify parent that processing is complete so we can enable chat
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('File upload failed.');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload">
        <label htmlFor="file-upload" className="custom-file-upload">
          {file ? file.name : 'Choose File'}
        </label>
        <input
          id="file-upload"
          className="file-upload-input"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          disabled={isLoading}
        />
        <button
          className="file-upload-button"
          onClick={handleUpload}
          disabled={isLoading || !file} 
        >
          {isLoading ? 'Processing...' : 'Process'}
        </button>
      </div>
      {uploadMessage && <p className="file-upload-message">{uploadMessage}</p>}
      
    </div>
  );
};

export default FileUpload;
