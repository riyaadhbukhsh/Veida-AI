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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
            
            if (allowedExtensions.includes(fileExtension)) {
                setFile(selectedFile);
                setError('');
            } else {
                setFile(null);
                setError('Please upload a PDF, JPEG, or PNG file.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        if (!userId) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }
    
        if (!file) {
            setError('Please upload course content (PDF, JPEG, or PNG)');
            setLoading(false);
            return;
        }
    
        const invalidChars = /[.!~*'()]/;
        if (invalidChars.test(name)) {
            setError('Please enter a valid course name without special characters: [.!~*\'()]');
            setLoading(false);
            return;
        }
        const today = new Date();
        const selectedDate = new Date(examDate);
        if (selectedDate < today) {
            setError('Please select a future date for the exam');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('clerk_id', userId);
        formData.append('course_name', name);
        formData.append('description', description);
        formData.append('exam_date', examDate);
        formData.append('file', file);
    
        try {
            const response = await fetch('https://veida-ai-backend-production.up.railway.app/api/create_course', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
         
    
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
    
            const responseText = await response.text();
            console.log('Response text:', responseText);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                throw new Error('Invalid JSON response from server');
            }
    
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
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;