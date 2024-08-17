"use client";

import { useParams} from 'next/navigation';
import CourseDetails from '../../components/CourseDetails';
import { unformatURL } from '../helpers';

export default function CourseDetailsPage() {
  const params = useParams();
  const urlCourseName = params['course-details'];
  const courseName = unformatURL(urlCourseName);

  return (
    <div id="course-page">
      <CourseDetails courseName={courseName} />
    </div>
  );
}