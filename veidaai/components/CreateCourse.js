import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";

const CreateCourse = ({ onCourseCreated, onClose }) => {
    const { userId } = useAuth();

    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [examDate, setExamDate] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateCourseName = (name) => {
        const invalidChars = /[.!~*'()]/;
        return !invalidChars.test(name);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateCourseName(name)) {
            setError('Please enter a valid course name without special characters: [.!~*\'()]');
            return;
        }
        if (!name || !description || !examDate) {
            setError('Please fill in all fields.');
            return;
        }
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        
        const today = new Date();
        const selectedDate = new Date(examDate);
        if (selectedDate < today) {
            setError('Please select a future date for the exam');
            setLoading(false);
            return;
        }

        setLoading(true); // Set loading state to true

        const formData = new FormData();
        formData.append('file', file);
        formData.append('clerk_id', userId);
        formData.append('course_name', name);
        formData.append('description', description);
        formData.append('exam_date', examDate);

        try {
            const extractResponse = await fetch('http://localhost:8080/api/extract_text', {
                method: 'POST',
                body: formData,
            });

            if (!extractResponse.ok) {
                const errorData = await extractResponse.json();
                setError(errorData.error || 'An error occurred while extracting text.');
                return;
            }

            const extractedData = await extractResponse.json();
            const notes = extractedData.notes || {};
            const flashcards = extractedData.flashcards || [];

            const createResponse = await fetch('http://localhost:8080/api/create_course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerk_id: userId,
                    course_name: name,
                    description: description,
                    exam_date: examDate,
                    notes: notes,
                    flashcards: flashcards,
                }),
            });

            if (createResponse.ok) {
                onCourseCreated({
                    clerk_id: userId,
                    course_name: name,
                    description: description,
                    exam_date: examDate,
                    notes: notes,
                    flashcards: flashcards,
                });
                setName('');
                setDescription('');
                setExamDate('');
                setFile(null);
                setError('');
                router.push('/client'); // Redirect to the course list page
            } else {
                const errorData = await createResponse.json();
                setError(errorData.message || 'An error occurred while creating the course.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false); // Reset loading state
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
                <label htmlFor="courseContent">Course Content - PDF, PNG, JPEG</label>
                <input
                    type="file"
                    id="courseContent"
                    onChange={handleFileChange}
                    required
                />
                {error && <p className="error-message">{error}</p>}
                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Submit'}
                    </button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;