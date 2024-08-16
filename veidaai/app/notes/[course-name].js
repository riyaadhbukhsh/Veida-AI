"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';

const NotesPage = ({ courseName }) => {
  const { userId } = useAuth();
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_notes?clerk_id=${userId}&course_name=${courseName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
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
    <div>
      <h1>Your Notes for {courseName}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="note">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </div>
          ))
        ) : (
          <p>No notes available.</p>
        )}
      </div>
    </div>
  );
};

export default NotesPage;