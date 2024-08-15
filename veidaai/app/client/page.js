"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import CreateCourse from "../../components/CreateCourse";
import "./client.css";

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

    // updates courses state with user's courses
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
        } else {
          console.error('Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
  
    useEffect(() => {
      if (userId) {
        fetchAndSetCourses();
      }
    }, [userId, fetchAndSetCourses]);

  useEffect(() => {
    if (userId) {
      fetchAndSetCourses();
    }
  }, [userId, fetchAndSetCourses]);

  const handleCourseCreated = (newCourse) => {
    setCourses([...courses, newCourse]);
    setShowCreateForm(false);
  };

  // format course names to be url friendly
  // replace white spaces with hyphens and encodes special characters
  function formatCourseName(courseName) {
    // replace white spaces with hyphens
    let hyphenated = courseName.replace(/\s+/g, '-');
    // encode special characters
    let encoded = encodeURIComponent(hyphenated);
    return encoded;
  }

  // load courses upon mounting
  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    if(userId) {
      fetchAndSetCourses();
    }
  }, [isSignedIn, userId]);

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

          <div id="courses-list">
            {courses.map((course, i) => (
              // <div key={course.course_name} className="course-item">
              <div key={i} className="course-item">
                <Link  href={`/${formatCourseName(course.course_name)}`}>
                  <h4 className="course">{course.course_name}</h4>
                </Link>
                {/* <p>{course.description}</p> */}
              </div>
            ))}
          </div>
        </div>
        ) : (
        <div style={{textAlign: 'center'}}>
          <h3>No courses yet</h3>
          {/* <p>Your courses will appear here</p> */}
          <button onClick={() => setShowCreateForm(true)}>
            Create a new course
          </button>
        </div>
      )}
      
      {/* create course form */}
      {showCreateForm && (
        <CreateCourse onCourseCreated={handleCourseCreated} />
      )}
    </div>
  );
};

export default ClientPage;