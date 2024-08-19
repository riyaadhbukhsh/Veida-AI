"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CreateCourse from "../../components/CreateCourse";
import "./client.css";
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from "@clerk/nextjs";

const ClientPage = () => {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else if (userId) {
      fetchAndSetCourses();
    }
  }, [isSignedIn, userId, router]);

  const fetchAndSetCourses = async () => {
    try {
      const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses?clerk_id=${userId}`, {
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
  }

  const handleCourseCreated = async (newCourse) => {
    setShowCreateForm(false);
    await fetchAndSetCourses(); // Fetch courses again after creating a new one
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleDeleteCourse = async (courseName) => {
    if (window.confirm(`Are you sure you want to delete the course "${courseName}"?`)) {
      try {
        const response = await fetch('https://veida-ai-backend-production.up.railway.app/api/delete_course', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clerk_id: userId, course_name: courseName }),
        });

        if (response.ok) {
          await fetchAndSetCourses(); // Refresh the course list
        } else {
          console.error('Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  function formatCourseName(courseName) {
    if (!courseName) return ''; 
    let hyphenated = courseName.replace(/\s+/g, '-');
    let encoded = encodeURIComponent(hyphenated);
    return encoded;
  }

  if (!isSignedIn) {
    return null; // Return null to avoid rendering anything while redirecting
  }

  return (
    <div className="client-page">
      <h1>Course Dashboard</h1>
      <div className="course-cards">
        <div className="course-card new-course" onClick={() => setShowCreateForm(true)}>
          <h2>Create New Course</h2>
        </div>
        {courses.map((course, index) => (
          <div key={index} className="course-card">
            <Link href={`/${formatCourseName(course.course_name)}`} className="course-link">
              <h2>{course.course_name || 'Unnamed Course'}</h2>
            </Link>
            <button
              className="delete-course-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(course.course_name);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      {showCreateForm && (
        <div className="create-course-overlay">
          <div className="create-course-form">
            <button className="close-button" onClick={() => setShowCreateForm(false)}>×</button>
            <CreateCourse 
              onCourseCreated={handleCourseCreated} 
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPage;