"use client";

import { useParams, useSearchParams } from 'next/navigation';
import "./course.css";

export default function CourseDetails() {
  const params = useParams();
  const searchParams = useSearchParams();

  const urlCourseName = params['course-details'];

  // If you need to access additional query parameters:
  // const additionalParam = searchParams.get('someParam');

  // unhyphenate & decode the course name
  function unformatCourseName(urlCourseName) {
    let decoded = decodeURIComponent(urlCourseName);
    let unhyphenated = decoded.replace(/-/g, ' ');
    return unhyphenated;
  }

  const courseName = unformatCourseName(urlCourseName);

  return (
    <div id="course-page">
      
      <h2>{courseName}</h2>
      <p>This is the dynamic page for course content</p>
      <button id="add-content-btn" onClick={()=>alert('add content')}>
        add content
      </button>
    
      <div id="course-content">
        <div id="flash-cards-container" className="study-container" onClick={()=>alert('study flash cards')}>
            <h2>Study Flash Cards</h2>
        </div>

        <div id="mcqs-container" className="study-container" onClick={()=>alert('study multiple choice questions')}>
            <h2>Study Multiple Choice Questions</h2>
        </div>
      </div>

    </div>
  );
}