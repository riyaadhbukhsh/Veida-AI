"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import "./client.css";

const ClientPage = () => {
  const { isSignedIn, user } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:8080/api/extract_text`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.extracted_text);
        setError('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred while uploading the file.');
    }
  };

  if (!isSignedIn) {
    return (
      <div className="client-page">
        <h1>Please sign in to access this page</h1>
      </div>
    );
  }

  return (
    <div className="client-page">
      <h1>Hello {user?.username || 'User'}, welcome to VeidaAI</h1>
      <h2>Upload your Lecture File! (PDF, Images)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ClientPage;