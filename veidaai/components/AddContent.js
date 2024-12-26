import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import Loading from './loading';

const AddContent = ({ courseName, conceptName, onClose, onContentAdded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setIsFileSelected(file !== null);
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid file type: PDF, PNG, JPG, or TXT.');
      setFile(null);
    }
  };

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
    formData.append('concept_name', conceptName);

    try {
      const extractResponse = await fetch(`https://veida-ai-backend-production.up.railway.app/api/extract_text`, {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'An error occurred while extracting text.');
      }

      const extractedData = await extractResponse.json();

      if (!extractedData.notes || !extractedData.flashcards || !extractedData.mc_questions) {
        throw new Error('Missing required data from extraction (notes, flashcards, or MCQs).');
      }

      const requestBody = {
        clerk_id: userId,
        course_name: courseName,
        concept_name: conceptName,
        notes: extractedData.notes,
        flashcards: extractedData.flashcards,
        mcqs: extractedData.mc_questions, // Include MCQs in the request body
      };

      const addContentResponse = await fetch(`https://veida-ai-backend-production.up.railway.app/api/add_course_concept_content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!addContentResponse.ok) {
        const errorData = await addContentResponse.json();
        throw new Error(errorData.message || 'Failed to add content');
      }

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
    <div className="course-create-course-overlay">
      {isUploading && <Loading />}
      <div className="course-create-course-form">
        <h2>Add to {courseName}: {conceptName}</h2>
        <p className="form-description">
          Our AI will add more flashcards, summary notes, and MCQs to your existing content.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="course-file-input-wrapper">
            <label htmlFor="file-upload" className="file-input-button">
              Upload Content File (PDF, PNG, JPG, TXT)
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              required
              style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="course-form-buttons">
            <button type="submit" disabled={isUploading || !isFileSelected}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
          </div>
        </form>
        <button className="course-close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default AddContent;
