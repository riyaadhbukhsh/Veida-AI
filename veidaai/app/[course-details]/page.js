"use client";

import { useParams, useSearchParams } from 'next/navigation';
import "./course.css";

export default function CourseDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const courseDetails = params['course-details'];
  
  // If you need to access additional query parameters:
  // const additionalParam = searchParams.get('someParam');


  return (
    <div id="course-page">
      <h2>Course: {courseDetails}</h2>
      <p>This is the dynamic page for course content</p>
    </div>
  );
}