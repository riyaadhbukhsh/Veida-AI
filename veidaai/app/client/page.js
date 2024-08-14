"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import "./client.css";
import CreateCourse from "../../components/CreateCourse";

const ClientPage = () => {
  const { isSignedIn, user, userId } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const fetchAndSetCourses = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        // console.log('courses', data.courses);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  const handleCourseCreated = (newCourse) => {
    setCourses([...courses, newCourse]);
    setShowCreateForm(false);
  };

  // load courses upon mounting
  useEffect(() => {
    if(userId) {
      fetchAndSetCourses();
    }
  }, [userId]);

  return (
    <div className="client-page">
      <h1>Hello {user?.username || 'User'}, welcome to VeidaAI</h1>
      <h2>Upload your Lecture File! (PDF, Images)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* display user's courses */}
      {courses.length > 0 ? (
        <div id="courses-container">

          <span id="courses-header">
            <h2>Your Courses</h2>
            <button id="add-course-btn-1" onClick={() => setShowCreateForm(true)} title="Add new course">+</button>
          </span>
          <hr></hr>

          {courses.map((course, i) => (
            // <div key={course.course_name} className="course-item">
              <div key={i} className="course-item">
              <h3 onClick={() => setShowCreateForm(true)}>
                {course.course_name}
              </h3>
              {/* <p>{course.description}</p> */}
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign: 'center'}}>
          <h3>No courses yet</h3>
          <p>Your courses will appear here</p>
          <button onClick={() => setShowCreateForm(true)}>
            Create a new course
          </button>
        </div>
      )}
      
      {/* course creation form */}
      {showCreateForm && (
        <CreateCourse onCourseCreated={handleCourseCreated} />
      )}
    </div>
  )
};

export default ClientPage;