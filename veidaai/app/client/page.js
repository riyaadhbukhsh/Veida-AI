"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import CourseList from "../../components/CourseList";
import Link from "next/link";
import "./client.css";
import CreateCourse from "../../components/CreateCourse";

const ClientPage = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isSignedIn, userId, user } = useAuth();

  const fetchAndSetCourses = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/get_courses?clerk_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        setError("Failed to fetch courses");
      }
    } catch (err) {
      setError("An error occurred while fetching courses");
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAndSetCourses();
    }
  }, [userId, fetchAndSetCourses]);

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchAndSetCourses();
    }
  }, [isSignedIn, userId, fetchAndSetCourses]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clerk_id", userId);

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setError("");
        setFile(null);
        e.target.reset();
      } else {
        setError("Failed to upload file");
      }
    } catch (err) {
      setError("An error occurred while uploading the file");
    }
  };

  const handleCourseCreated = (newCourse) => {
    setCourses([...courses, newCourse]);
    setShowCreateForm(false);
  };

  function formatCourseName(courseName) {
    let hyphenated = courseName.replace(/\s+/g, "-");
    let encoded = encodeURIComponent(hyphenated);
    return encoded;
  }

  if (!isSignedIn) {
    return (
      <div className="client-page">
        <h1>Please sign in to access this page</h1>
      </div>
    );
  }

  return (
    <div className="client-page">
      <h1>Hello {user?.username || "User"}, welcome to VeidaAI</h1>
      <h2>Upload your Lecture File! (PDF, Images)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <CourseList courses={courses} />

      {courses.length > 0 ? (
        <div>
          <button onClick={() => setShowCreateForm(true)}>Add Course</button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3>No courses yet</h3>
          <button onClick={() => setShowCreateForm(true)}>
            Create a new course
          </button>
        </div>
      )}

      {showCreateForm && (
        <CreateCourse onCourseCreated={handleCourseCreated} />
      )}
    </div>
  );
};

export default ClientPage;
