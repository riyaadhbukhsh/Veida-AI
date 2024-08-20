import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const CreateCourse = ({ onCourseCreated, onClose }) => {
    const { userId } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [examDate, setExamDate] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);
    const [courseSchedule, setCourseSchedule] = useState({
        Monday: "",
        Tuesday: "",
        Wednesday: "",
        Thursday: "",
        Friday: "",
        Saturday: "",
        Sunday: "",
    });

    useEffect(() => {
        // Update form validity
        setIsFormValid(
            [name, description, examDate].every((field) => field.trim() !== "") &&
            file !== null
        );
    }, [name, description, examDate, file]);

    const checkDuplicateCourseName = async (name) => {
        try {
            const response = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                return data.courses.some(course => course.course_name.toLowerCase() === name.toLowerCase());
            }
        } catch (error) {
            console.error("Error checking for duplicate course name:", error);
        }
        return false;
    };

    const validateCourseName = (name) => !/[.!~*'()]/.test(name);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        setFileName(file ? file.name : "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        if (!validateCourseName(name)) {
            setError("Please enter a valid course name without special characters: [.!~*'()]");
            setLoading(false);
            submitButton.disabled = false;
            return;
        }
        if (!isFormValid) {
            setError("Please fill in all fields.");
            setLoading(false);
            submitButton.disabled = false;
            return;
        }

        if (await checkDuplicateCourseName(name)) {
            setError("A course with this name already exists. Please choose a different name.");
            setLoading(false);
            submitButton.disabled = false;
            return;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const selectedDate = new Date(examDate).setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError("Please select a future date for the exam");
            setLoading(false);
            submitButton.disabled = false;
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("clerk_id", userId);
        formData.append("course_name", name);
        formData.append("description", description);
        formData.append("exam_date", examDate);

        try {
            const extractResponse = await fetch("http://localhost:8080/api/extract_text", {
                method: "POST",
                body: formData,
            });

            if (!extractResponse.ok) {
                const errorData = await extractResponse.json();
                setError(errorData.error || "An error occurred while extracting text.");
                setLoading(false);
                submitButton.disabled = false;
                return;
            }

            const extractedData = await extractResponse.json();
            const { notes = {}, flashcards = [], mc_questions = [] } = extractedData;
            console.log('Notes:', notes);
            console.log('Flashcards:', flashcards);
            console.log('MC Questions:', mc_questions);

            const createResponse = await fetch("http://localhost:8080/api/create_course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerk_id: userId,
                    course_name: name,
                    description,
                    exam_date: examDate,
                    notes,
                    flashcards,
                    mc_questions,
                    course_schedule: courseSchedule,
                }),
            });

            if (createResponse.ok) {
                onCourseCreated({
                    clerk_id: userId,
                    course_name: name,
                    description,
                    exam_date: examDate,
                    notes,
                    flashcards,
                    mc_questions,
                    course_schedule: courseSchedule,
                });
                setName("");
                setDescription("");
                setExamDate("");
                setFile(null);
                setError("");
                setCourseSchedule({
                    Monday: "",
                    Tuesday: "",
                    Wednesday: "",
                    Thursday: "",
                    Friday: "",
                    Saturday: "",
                    Sunday: "",
                });
                router.push("/client"); // Redirect to the course list page
            } else {
                const errorData = await createResponse.json();
                setError(errorData.message || "An error occurred while creating the course.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
            submitButton.disabled = false;
        }
    };

    return (
        <div className="create-course-overlay">
            <form onSubmit={handleSubmit} className="create-course-form">
                <h2>Create a New Course</h2>
                <input
                    type="text"
                    placeholder="Course Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Course Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                />
                {/*<div>
                    <h3>Course Schedule</h3>
                    {Object.keys(courseSchedule).map((day) => (
                        <div key={day}>
                            <label>{day}: </label>
                            <input
                                type="time"
                                value={courseSchedule[day]}
                                onChange={(e) =>
                                    handleCourseScheduleChange(day, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div> */}
                <div className="file-input-wrapper">
                    <div className="file-input-button">
                        {fileName || "Choose Course Content (PDF, PNG, JPEG)"}
                    </div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <div className="form-buttons">
                    <button type="submit" disabled={!isFormValid || loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
                <button className="close-button" onClick={onClose}>
                    ×
                </button>
            </form>
        </div>
    );
};

export default CreateCourse;
