"use client";

import React, { useState, useEffect } from "react";
import CourseList from "../../components/CourseList";
import Link from "next/link";
import "./client.css";
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from "@clerk/nextjs";

const ClientPage = () => {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in'); 
    } else {
      fetchCourses();
    }
  }, [isSignedIn, userId]);

  const fetchCourses = async () => {
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
  };

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