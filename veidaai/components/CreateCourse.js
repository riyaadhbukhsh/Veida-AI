'use client';
import React, { useState } from 'react';
import { useAuth } from "@clerk/nextjs";

const CreateCourse = ({ onCourseCreated }) => {
    const { userId } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            // console.log('pre fetch\nuserId: ', userId);
            try {
                const response = await fetch('http://localhost:8080/api/create_course', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clerk_id: userId,
                        course_name: name,
                    }),
                });
                if (response.ok) {
                    const newCourse = await response.json();
                    onCourseCreated(newCourse);
                    setName('');
                    setDescription('');
                    setError('');
                } else {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    const errorData = JSON.parse(errorText);
                    setError(errorData.message || 'Failed to create course');
                }
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                setError('An error occurred while communicating with the server.');
            }
        } catch (err) {
            console.error('Outer error:', err);
            setError('An unexpected error occurred.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Course Name"
            required
        />
        {/* <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Course Description"
            required
        /> */}
        <button type="submit">Create Course</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default CreateCourse;