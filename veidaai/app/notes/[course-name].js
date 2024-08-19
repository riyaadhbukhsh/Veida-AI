import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const NotesPage = ({ courseName }) => {
  const { userId } = useAuth();
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        let courseIndex = data.courses.findIndex(course => courseName.localeCompare(course.course_name) == 0);
        let courseObj = data.courses[courseIndex];
        setNotes(courseObj.notes || ''); // Set to empty string if notes is null or undefined
      } else {
        setError('Failed to fetch notes');
      }
    } catch (err) {
      setError('An error occurred while fetching notes');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId, fetchNotes]);

  return (
    <div className="main-inline">
      <div className="container">
        <h1 className="title">Your Notes for {courseName}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div id="notes-content" style={{padding: '2em', margin: '1em 3em', borderTop: '1px solid gray'}}>
          {notes ? (
            <p style={{whiteSpace: 'pre-wrap'}}>
              {typeof notes === 'string' ? notes : JSON.stringify(notes, null, 2)}
            </p>
          ) : (
            <p id="unavailable">No notes available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;