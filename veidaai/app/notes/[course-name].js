"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';

const NotesPage = () => {
    const { userId } = useAuth();
    const params = useParams();
    const urlCourseName = params['course-name'];
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');

    const unformatCourseName = (urlCourseName) => {
        let decoded = decodeURIComponent(urlCourseName);
        let unhyphenated = decoded.replace(/-/g, ' ');
        return unhyphenated;
    };

    const courseName = unformatCourseName(urlCourseName);

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
    }, [userId]);

    return (
        <div>
            <h1>Notes for {courseName}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                {notes.length > 0 ? (
                    notes.map((note, index) => (
                        <div key={index} className="note">
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                        </div>
                    ))
                ) : (
                    <p>No notes available for this course.</p>
                )}
            </div>
        </div>
    );
};

export default NotesPage;