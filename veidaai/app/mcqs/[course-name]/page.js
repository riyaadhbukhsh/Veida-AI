"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';
//import FlashCard from '@/components/FlashCard';
import { unformatURL } from '@/app/helpers';
import { FaArrowLeft } from 'react-icons/fa';
//import './mcqs-page.css';

function McqsPage() {
    const { userId } = useAuth();
    const [mcqs, setMcqs] = useState([]);
    const [error, setError] = useState(null);


    const params = useParams();
    const urlCourseName = params['course-name'];
    const courseName = unformatURL(urlCourseName);

    const fetchMcqs = async () => {
        try {
            
            const response = await fetch(`http://localhost:8080/api/get_mcqs?clerk_id=${userId}&course_name=${courseName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            setMcqs(data.mcqs);
        } else {
            setError('Failed to fetch flashcards');
        } 
        }catch (error) {
            setError('Failed to fetch flashcards');
        }
            
    };


    useEffect(() => {
        if (userId) {
          fetchMcqs();
        }
      }, [userId, courseName]);
    
    return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Link href={`/${urlCourseName}`} title={`back to ${courseName}`} className="back-arrow-link"><FaArrowLeft/></Link>
        <h1>Your MCQs for {courseName}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
        {mcqs.length > 0 ? (
            mcqs.map((question) => (
            <div key={question.concept} className="question">
                <h3>{question.concept}</h3>
                <h4>{question.question_type}</h4>
                <p><b>{question.question}</b></p>
                {question.possible_answers.map((answer, index) => (
                <p key={index}>{String.fromCharCode(97 + index)}. {answer}</p>
                ))}
                <p><b>Answer: {question.correct_answer}</b></p>
                <p>{question.why}</p>
            </div>
            ))
        ) : (
            <p>No MCS available.</p>
        )}
        </div>
    </div>
    );
};
export default McqsPage;


