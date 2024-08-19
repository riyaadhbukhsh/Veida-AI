import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";

const CreateCourse = ({ onCourseCreated, onClose }) => {
    const { userId } = useAuth();

    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [examDate, setExamDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!userId) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        const invalidChars = /[.!~*'()]/;
        if (invalidChars.test(name)) {
            setError('Please enter a valid course name without special characters: [.!~*\'()]');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://veida-ai-backend-production.up.railway.app/api/create_course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerk_id: userId,
                    course_name: name,
                    description: description,
                    exam_date: examDate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create course');
            }

            const data = await response.json();
            onCourseCreated(data);
            onClose();
        } catch (error) {
            console.error('Error creating course:', error);
            setError(`Error creating course: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-course-modal">
            <form className="create-course-form" onSubmit={handleSubmit}>
                <h2>Create New Course</h2>
                <label htmlFor="courseName">Course Name</label>
                <input
                    type="text"
                    id="courseName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                ></textarea>
                <label htmlFor="examDate">Exam Date</label>
                <input
                    type="date"
                    id="examDate"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;