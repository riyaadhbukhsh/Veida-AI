"use client";

import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import CourseList from "../../components/CourseList";
import Link from "next/link";
import CourseList from "../../components/CourseList";
import Link from "next/link";
import "./client.css";

const ClientPage = () => {
  const { isSignedIn, user, userId } = useAuth();
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
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
    if (isSignedIn && userId) {
      fetchCourses();
    }
  }, [isSignedIn, userId]);

  return (
    <div className="client-page">
      <h1>Hello {user?.username || 'User'}, welcome to VeidaAI</h1>
      <Link href="/create-course">
        <button>+ New Course</button>
      </Link>
      <CourseList courses={courses} />
    </div>
  );
};

export default ClientPage;