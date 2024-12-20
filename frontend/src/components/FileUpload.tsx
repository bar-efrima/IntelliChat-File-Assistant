import React, { useState } from 'react';
import axios from 'axios';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // The type for file objects
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { // The type for file input change events
    if (event.target.files && event.target.files.length > 0) { // Check if files were selected
      setFile(event.target.files[0]); // Set the first file in the list
    }
  };

 
  const handleUpload = async () => { // async function for uploading files
    if (!file) {
      alert('Please select a file to upload.');  // Alert the user if no file was selected
      return;
    }

    const formData = new FormData(); // create a formdata object (allows to combine form data to send in an HTTP request)
    formData.append('file', file); // append the file to the form data

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      setUploadMessage(response.data.message); // reponse message from the backend
    } catch (error) {
      console.error('Error uploading file:', error); 
      setUploadMessage('File upload failed.');
    }
  };

  return (
    <div>
      <h2>Upload a File</h2>
      <input
        type="file"
        onChange={handleFileChange} // Call the handleFileChange function when the file input changes
        accept=".pdf,.doc,.docx"
      />
      <button onClick={handleUpload}>Upload</button>
      {uploadMessage && <p>{uploadMessage}</p>}
    </div>
  );
};

export default FileUpload;
