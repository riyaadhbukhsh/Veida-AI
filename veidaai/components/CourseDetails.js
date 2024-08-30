import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import { formatURL } from '@/app/helpers';
import { FaRegLightbulb, FaRegStickyNote, FaRegQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import AddContentModal from './AddContentModal';
import AddConceptModal from './AddConceptModal';

import './course-details.css'; // Ensure this import is correct

const CourseDetails = ({ courseName }) => {
  const { userId } = useAuth();
  const [courseObj, setCourseObj] = useState({});
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showAddConceptModal, setShowAddConceptModal] = useState(false);
  const [courseConcepts, setCourseConcepts] = useState([]);
  const [conceptName, setConceptName] = useState('');

  useEffect(() => {
    if(userId){
      fetchCourseObj();
    }
  }, [courseName, userId]);

  const fetchCourseObj = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_course_concepts?clerk_id=${userId}&course_name=${courseName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        
        setCourseConcepts(data.concepts);
        console.log(data.concepts);
      } else {
        console.error('Failed to fetch course. Response error: ', response.ok);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleAddContent = () => {
    setShowAddContentModal(true);
  };
  const handleAddConcept = () => {
    setShowAddConceptModal(true);
  };

  const handleContentAdded = () => {
    fetchCourseObj(); // Refresh the course data after adding content
  };

  const handleConceptAdded = () => {
    fetchCourseObj(); // Refresh the course data after adding concept
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };



  return (
    
    <div className="course-details-container">
      <Link href={`/client`} title={'back to your courses'} className="course-back-arrow-link"><FaArrowLeft/></Link>
      <h2 className="course-title">{courseName}</h2>
      {courseObj.exam_date && (
        <p className="course-exam-date">Exam Date: {formatDate(courseObj.exam_date)}</p>
      )}
      {courseObj.description && (
        <p className="course-description">{courseObj.description}</p>
      )}
      <button id="add-content-btn" onClick={handleAddContent} className="course-add-content-btn">
        Add Content
      </button>
      <button id="add-concept-btn" onClick={handleAddConcept} className="course-add-content-btn">
        Add Concept
      </button>
      

      <div> 
      <h3>Course Showing</h3>
      <p>{courseName}</p>
      </div>


      <div className="course-concepts-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {courseConcepts.length > 0 ? (
          courseConcepts.map((concept, index) => (
            <div key={index} className="course-concept">

          <Link href={`/concept-details/${concept.concept_name.replace(/\s+/g, '-')}?courseName=${courseName}`}>
            <h3>{concept.concept_name}</h3>
          </Link>


              <p>{concept.concept_description}</p>
            </div>
          ))
        ) : (
          <p>No concepts available.</p> // Message when no concepts are present
        )}
      </div>

      {/* <div className="course-content">
      <Link href={`/flashcards/${formatURL(courseName)}`} className="course-study-container">
          <div>
            <FaRegLightbulb className="course-study-icon" />
            <h3>Flashcards</h3>
          </div>
          <p>Study with interactive flashcards to reinforce key concepts</p>
        </Link>
        <Link href={`/notes/${formatURL(courseName)}`} className="course-study-container">
          <div>
            <FaRegStickyNote className="course-study-icon" />
            <h3>Notes</h3>
          </div>
          <p>Review and organize your course notes efficiently</p>
        </Link>
        <Link href={`/mcqs/${formatURL(courseName)}`} className="course-study-container">
          <div>
            <FaRegQuestionCircle className="course-study-icon" />
            <h3>MCQs</h3>
          </div>
          <p>Test your knowledge with multiple choice questions</p>
        </Link>
      </div> */}

      {showAddContentModal && (
        <AddContentModal
          courseName={courseName}
          onClose={() => setShowAddContentModal(false)}
          onContentAdded={handleContentAdded}
        />
      )}
      {showAddConceptModal && (
        <AddConceptModal
          courseName={courseName}
          onClose={() => setShowAddConceptModal(false)}
          onConceptAdded={handleConceptAdded}
        />
      )}
    </div>
  );
};

export default CourseDetails;