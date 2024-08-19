"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from 'react';
import CourseDetails from '../../components/CourseDetails';
import NotFound from '../not-found';
import Loading from '../../components/loading';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [courseExists, setCourseExists] = useState(null);
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

    const checkCourseExists = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses?clerk_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const exists = data.courses.some(course => course.course_name === courseName);
          if (isMounted) {
            setCourseExists(exists);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setCourseExists(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking course existence:', error);
        if (isMounted) {
          setCourseExists(false);
          setIsLoading(false);
        }
      }
    };

    if (isLoaded && !isSignedIn) {
      router.push('/404');
      return;
    } else if (isSignedIn && userId) {
      checkCourseExists();
    }

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, userId, courseName, router]);

  if (!isLoaded || !isSignedIn) {
    return null; // Return null while checking auth state to avoid flash of loading
  }

  if (isLoading) {
    return <Loading />;
  }

  if (courseExists === false) {
    return <NotFound />;
  }

  return (
    <div id="course-page">
      <CourseDetails courseName={courseName} />
    </div>
  );
}