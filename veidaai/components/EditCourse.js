import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";

const EditCourse = ({ course, onCourseUpdated, onClose }) => {
  const [name, setName] = useState(course.course_name);
  const [description, setDescription] = useState(course.description);
  const [examDate, setExamDate] = useState(course.exam_date);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false); // State to track form validity
  const { userId } = useAuth();

  useEffect(() => {
    // Check if all fields are filled and if there are changes compared to the initial state
    const isUnchanged =
      name.trim() === course.course_name &&
      description.trim() === course.description &&
      examDate.trim() === course.exam_date;

    setIsFormValid(
      name.trim() !== '' &&
      description.trim() !== '' &&
      examDate.trim() !== '' &&
      !isUnchanged // Ensure the form is only valid if there are changes
    );
  }, [name, description, examDate, course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      clerk_id: userId,
      original_course_name: course.course_name, // Pass the original course name
      course_name: name,
      description: description,
      exam_date: examDate,
    };

    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:8080/api/update_course', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Course updated successfully');
        onCourseUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.error || 'An error occurred while updating the course.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while updating the course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Course</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Course Name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Course Description"
        required
      />
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        placeholder="Exam Date"
        required
      />
      {error && <p className="error">{error}</p>}
      <div className="form-buttons">
        <button type="submit" disabled={loading || !isFormValid}>
          {loading ? 'Updating...' : 'Update'}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditCourse;
