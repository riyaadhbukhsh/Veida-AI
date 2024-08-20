"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import CourseDetails from '../../components/CourseDetails';
import NotFound from '../not-found';
import Loading from '../../components/loading';

export default function CourseDetailsPage() {
  const { userId } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [pageExists, setPageExists] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlCourseName = params['course-details'];

  function unformatCourseName(urlCourseName) {
    let decoded = decodeURIComponent(urlCourseName);
    let unhyphenated = decoded.replace(/-/g, ' ');
    return unhyphenated.trim();
  }
  
  const courseName = unformatCourseName(urlCourseName);

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

  return (
    <div id="course-page">
      <CourseDetails courseName={courseName} />
    </div>
  );
}