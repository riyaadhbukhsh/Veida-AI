import React from "react";
import Link from "next/link";
import "./course-details.css";

const CourseDetails = ({ courseName }) => {
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