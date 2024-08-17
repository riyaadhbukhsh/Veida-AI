import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { formatURL } from "@/app/helpers";
import "./course-details.css";

const CourseDetails = ({ courseName }) => {
  const [courseObj, setCourseObj] = useState({});
  const { userId } = useAuth();

  const fetchCourseObj = async () => {
    try {
      const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses?clerk_id=${userId}` , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch successful. Response: ', data);
        //comparison might have to be rewritten in case url en/decoding goes awry
        let courseIndex = data.courses.findIndex( course => courseName.localeCompare(course.course_name) == 0);
        let courseObj = data.courses[courseIndex];
        //console.log('This course\'s obj: ', data.courses[courseObj]);
        setCourseObj(courseObj);
      }
      else {
        console.error('Failed to fetch course. Response error: ', response.ok);
      }
    }
    catch (error) {
      console.error('Error fetching course details:', error);
    }
  }

  useEffect(()=>{
    if(userId) {
      fetchCourseObj();
    }
  }, [userId]);

  return (

    <div id="course-page">
      
      <h2>{courseName}</h2>
      <button id="add-content-btn" onClick={()=>alert('add content')}>
        add content
     </button>
      <div id="course-content">
            <Link id="flash-cards-container" className="study-container" href={`/flashcards/${formatURL(courseName)}`}>
                <button>Study Flashcards</button>
            </Link>
            <Link id="notes-container" className="study-container" href={`/notes/${formatURL(courseName)}`}>
                <button>Study Notes</button>
            </Link>
            <Link id="mcqs-container" className="study-container" href={`/mcqs/${formatURL(courseName)}`}>
                <button>Study Multiple Choice Questions</button>
            </Link>
      </div>
    </div>
  );
};

export default CourseDetails;