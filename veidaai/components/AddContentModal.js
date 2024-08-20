import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";

const AddContentModal = ({ courseName, onClose, onContentAdded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setIsFileSelected(file !== null);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    if (!file) {
      setError('Please select a file to upload');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clerk_id', userId);
    formData.append('course_name', courseName);

    try {
      const extractResponse = await fetch('http://localhost:8080/api/extract_text', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'An error occurred while extracting text.');
      }

      const extractedData = await extractResponse.json();
      console.log('Extracted Data:', extractedData);

      const requestBody = {
        clerk_id: userId,
        course_name: courseName,
        notes: extractedData.notes,
        flashcards: extractedData.flashcards,
      };
      console.log('Request Body:', requestBody);

      const addContentResponse = await fetch('http://localhost:8080/api/add_course_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!addContentResponse.ok) {
        const errorData = await addContentResponse.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to add content');
      }

      const responseData = await addContentResponse.json();
      console.log('Success response:', responseData);

      onContentAdded();
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An error occurred while adding content');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-course-overlay">
      <div className="create-course-form">
        <h2>Add to {courseName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="file-input-wrapper">
            <div className="file-input-button">Choose Content File (PDF, PNG, JPEG)</div>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              disabled={isUploading}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button type="submit" disabled={isUploading || !isFileSelected}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
          </div>
        </form>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default AddContentModal;
