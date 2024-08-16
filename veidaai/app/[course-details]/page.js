"use client";

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import CourseDetails from '../../components/CourseDetails';

export default function CourseDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCourseName = params['course-details'];

  // unhyphenate & decode the course name
  function unformatCourseName(urlCourseName) {
    let decoded = decodeURIComponent(urlCourseName);
    let unhyphenated = decoded.replace(/-/g, ' ');
    return unhyphenated;
  }

  const courseName = unformatCourseName(urlCourseName);

  // Fetch the list of courses from your API or state management
  const courses = []; // Replace with your actual course data

  // Check if the course name exists in the list of courses
  const courseExists = courses.some(course => course.name === courseName);

  if (!courseExists) {
    // If the course doesn't exist, redirect to a 404 page or back to the client page
    router.push('/'); // or router.push('/client');
    return null;
  }

  return (
    <div id="course-page">
      <CourseDetails courseName={courseName} />
    </div>
  );
}