"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import CourseDetails from '../../components/CourseDetails';
import NotFound from '../not-found';
import Loading from '../../components/loading';
import './details.css'; // Ensure this import is correct
import { unformatURL } from '@/app/helpers';

export default function CourseDetailsPage() {
  const { userId } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [pageExists, setPageExists] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  

  const urlCourseName = params['course-details'];
  
  const courseName = unformatURL(urlCourseName);

  useEffect(() => {
    let isMounted = true;
  
    const checkPageExists = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const exists = data.courses.some(course => {
            return course.course_name.toLowerCase() === courseName.toLowerCase();
          });
          if (isMounted) {
            setPageExists(exists);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setPageExists(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setPageExists(false);
          setIsLoading(false);
        }
      }
    };
  
    if (userId) {
      checkPageExists();
    }
  
    return () => {
      isMounted = false;
    };
  }, [courseName, userId]);

  if (isLoading) {
    return <Loading />;
  }
  
  if (pageExists === false) {
    return <NotFound />;
  }
  
  if (pageExists === null) {
    return (
      <div className="course-container">
        <h1 className="course-title">404</h1>
        <h2 className="course-subtitle">Page Not Found</h2>
        <p className="course-message">The resource you are looking for does not exist.</p>
        <button onClick={() => window.location.href = '/'} className="course-returnButton">Return Home</button>
      </div>
    );
  }
  
  
  return (
    <div id="course-page">
      <CourseDetails courseName={courseName} />
    </div>
  );
}