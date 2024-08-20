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
      const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses?clerk_id=${userId}`, {
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

  const parseTextWithLatex = (text) => {
    if (typeof text !== 'string') return '';

    // Handle display math \[...\]
    text = text.replace(/\\\[(.*?)\\\]/gs, '$$ $1 $$'); // Convert \[...\] to $$ ... $$

    // Handle inline math \(...\)
    text = text.replace(/\\\((.*?)\\\)/g, '$ $1 $'); // Convert \(...\) to $ ... $

    // Handle cases where there are trailing or leading spaces around math delimiters
    text = text.replace(/\$\$ +([^$]+) +\$\$/g, '$$ $1 $$'); // Convert extra spaces within $$ ... $$ to single space
    text = text.replace(/\$ +([^$]+) +\$/g, '$ $1 $'); // Convert extra spaces within $ ... $ to single space
  
    return text;
  };
  
  useEffect(() => {
    if (notes) {
      const updatedText = parseTextWithLatex(notes);
      setParsedNotes(updatedText);
    }
  }, [notes]);

  return (
    <div className="main-inline">
      <div className="container">
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
