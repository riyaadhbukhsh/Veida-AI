"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import Markdown from 'markdown-to-jsx';
import { useParams } from 'next/navigation';
import { unformatURL } from '@/app/helpers';
import { FaArrowLeft } from 'react-icons/fa'
import './notes.css';

const NotesPage = () => {
  const { userId } = useAuth();
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState('');

  const params = useParams();
  const urlCourseName = params['course-name'];
  const courseName = unformatURL(urlCourseName);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses?clerk_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        let courseIndex = data.courses.findIndex( course => courseName.localeCompare(course.course_name) == 0);
        let courseObj = data.courses[courseIndex];
        setNotes(courseObj.notes);
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
        <Link href={`/${urlCourseName}`} title={`back to ${courseName}`} className="back-arrow-link"><FaArrowLeft/></Link>
        <h1 className="title">Your Notes for {courseName}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div id="notes-content">
          {notes ? (
              <div id='markdown'>
                <Markdown>{notes}</Markdown>
              </div>
          ) : (
            <p id="unavailable">No notes available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
