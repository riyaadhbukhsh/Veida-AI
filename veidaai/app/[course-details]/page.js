"use client";

import { useParams} from 'next/navigation';
import CourseDetails from '../../components/CourseDetails';

export default function CourseDetailsPage() {
  const params = useParams();


  const urlCourseName = params['course-details'];

  // unhyphenate & decode the course name
  function unformatCourseName(urlCourseName) {
    let decoded = decodeURIComponent(urlCourseName);
    let unhyphenated = decoded.replace(/-/g, ' ');
    return unhyphenated;
  }

  const courseName = unformatCourseName(urlCourseName);

  return (
    <div id="course-page">
      <CourseDetails courseName={courseName} />
    </div>
  );
}