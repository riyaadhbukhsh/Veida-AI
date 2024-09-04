import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import { formatURL } from '@/app/helpers';
import { FaRegLightbulb, FaRegStickyNote, FaRegQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import AddConceptModal from './AddConceptModal';

import "./course-details.css"

const CourseDetails = ({ courseName }) => {
  const { userId } = useAuth();
  const [courseObj, setCourseObj] = useState({});
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
        
      } else {
        console.error('Failed to fetch course. Response error: ', response.ok);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleAddConcept = () => {
    setShowAddConceptModal(true);
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
      <h1 className="course-title">{courseName}</h1>
      {courseObj.exam_date && (
        <p className="course-exam-date">Exam Date: {formatDate(courseObj.exam_date)}</p>
      )}
      {courseObj.description && (
        <p className="course-description">{courseObj.description}</p>
      )}      

      <div className="course-cards">
        <button className="course-card new-course" onClick={handleAddConcept}>
          <h2>Add Concept</h2>
        </button>

        {courseConcepts.length > 0 ? (
          courseConcepts.map((concept, index) => (
            <div key={index} className="course-card">
              <Link href={`/concept-details/${concept.concept_name.replace(/\s+/g, '-')}?courseName=${courseName}`} className="course-link">
                <h2>{concept.concept_name}</h2>
              </Link>
              <button className="edit-course-button" onClick={() => handleEditCourse(course)}>
                <i className="fas fa-pencil-alt"></i>
              </button>
              <button
                className="delete-course-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course.course_name);
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))
        ) : (
          <p>No concepts available.</p> // Message when no concepts are present
        )}
      </div>

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