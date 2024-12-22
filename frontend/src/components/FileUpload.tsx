import React, { useState } from 'react';
import axios from 'axios';
import '../styles/FileUpload.css'; // Import the CSS module

interface FileUploadProps {
  onFileProcessed: () => void; // Callback to notify parent when the file is processed
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

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
      onFileProcessed(); // Notify parent that processing is complete
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('File upload failed.');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-header">
        <h2>Upload a File</h2>
      </div>
      <input
        className="file-upload-input"
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        disabled={isLoading}
      />
      <button
        className="file-upload-button"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Upload'}
      </button>
      {uploadMessage && <p className="file-upload-message">{uploadMessage}</p>}
    </div>
  );
};

export default FileUpload;
