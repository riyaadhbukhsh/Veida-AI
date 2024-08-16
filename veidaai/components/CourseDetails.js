import React from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import "./course-details.css";

const CourseDetails = ({ courseName }) => {
  const [courseObj, setCourseObj] = useState({});
  const { userId } = useAuth();

  const fetchCourseObj = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}` , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // TODO: extract specific course from data.courses[] & set it to courseObj state
        // setCourseObj( data.courses(courseName) )
      }
      else {
        console.error('Failed to fetch course. Response error: ', response.ok);
      }
    }
    catch (error) {
      console.error('Error fetching course details:', error);
    }
  }

  const formatCourseName = (courseName) => {
    let hyphenated = courseName.replace(/\s+/g, '-');
    return encodeURIComponent(hyphenated);
  };

  return (

    <div id="course-page">
      
      <h2>{courseName}</h2>
      <button id="add-content-btn" onClick={()=>alert('add content')}>
        add content
     </button>
      <div id="course-content">
            <Link id="flash-cards-container" className="study-container" href={`/flashcards/${formatCourseName(courseName)}`}>
                <button>Study Flashcards</button>
            </Link>
            <Link id="notes-container" className="study-container" href={`/notes/${formatCourseName(courseName)}`}>
                <button>Study Notes</button>
            </Link>
            <Link id="mcqs-container" className="study-container" href={`/mcqs/${formatCourseName(courseName)}`}>
                <button>Study Multiple Choice Questions</button>
            </Link>
      </div>
    </div>
  );
};

export default CourseDetails;