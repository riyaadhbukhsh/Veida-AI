"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CourseDetails from '../../components/CourseDetails';
import NotFound from '../not-found';
import Loading from '../../components/loading';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [pageExists, setPageExists] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlCourseName = params['course-details'];

  function unformatCourseName(urlCourseName) {
    let decoded = decodeURIComponent(urlCourseName);
    let unhyphenated = decoded.replace(/-/g, ' ');
    return unhyphenated;
  }

  const courseName = unformatCourseName(urlCourseName);

  useEffect(() => {
    let isMounted = true;

    const checkPageExists = async () => {
      try {
        const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses`);
        if (response.ok) {
          const data = await response.json();
          const exists = data.courses.some(course => course.course_name === courseName);
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
        console.error('Error checking page existence:', error);
        if (isMounted) {
          setPageExists(false);
          setIsLoading(false);
        }
      }
    };

    checkPageExists();

    return () => {
      isMounted = false;
    };
  }, [courseName]);

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
