"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useParams } from 'next/navigation';
import { unformatURL } from '@/app/helpers';
import { FaArrowLeft } from 'react-icons/fa';
import 'katex/dist/katex.min.css';
import './notes.css';

const NotesPage = () => {
  const { userId } = useAuth();
  const [notes, setNotes] = useState(null);
  const [parsedNotes, setParsedNotes] = useState('');
  const [error, setError] = useState('');

  const params = useParams();
  const urlCourseName = params['course-name'];
  const courseName = unformatURL(urlCourseName);

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
        const courseIndex = data.courses.findIndex(course => courseName.localeCompare(course.course_name) === 0);
        const courseObj = data.courses[courseIndex];
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
  }, [userId]);

  const convertMath = (text) => {
    if (typeof text !== 'string') return '';
  
    return text
      .replace(/\\text{([^}]*)}/g, (fullMatch) => {
        return fullMatch.replace(/#/g, '\\#');
      })
      .replace(/\\\[(.*?)\\\]/gs, '$$ $1 $$')
      .replace(/\\\((.*?)\\\)/g, '$ $1 $')
      .replace(/\$\$ +([^$]+) +\$\$/g, '$$ $1 $$')
      .replace(/\$ +([^$]+) +\$/g, '$ $1 $');
  };
  
  
  useEffect(() => {
    if (notes) {
      const updatedText = convertMath(notes);
      setParsedNotes(updatedText);
    }
  }, [notes]);

  return (
    <div className="main-inline">
      <div className="notes-container">
        <Link href={`/${urlCourseName}`} title={`back to ${courseName}`} className="back-arrow-link"><FaArrowLeft /></Link>
        <h1 className="title">Your Notes for {courseName}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div id="notes-content">
          {parsedNotes ? (
            <ReactMarkdown
              children={parsedNotes}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            />
          ) : (
            <p id="unavailable">No notes available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
