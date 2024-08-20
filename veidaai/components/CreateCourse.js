import React, { useState } from "react";
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
    const [courseSchedule, setCourseSchedule] = useState({
        Monday: "",
        Tuesday: "",
        Wednesday: "",
        Thursday: "",
        Friday: "",
        Saturday: "",
        Sunday: "",
    });

    const validateCourseName = (name) => {
        const invalidChars = /[.!~*'()]/;
        return !invalidChars.test(name);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCourseScheduleChange = (day, time) => {
        setCourseSchedule((prevSchedule) => ({
            ...prevSchedule,
            [day]: time,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateCourseName(name)) {
            setError(
                "Please enter a valid course name without special characters: [.!~*'()]"
            );
            return;
        }
        if (!name || !description || !examDate) {
            setError("Please fill in all fields.");
            return;
        }
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const today = new Date();
        const selectedDate = new Date(examDate);
        if (selectedDate < today) {
            setError("Please select a future date for the exam");
            setLoading(false);
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
            const extractResponse = await fetch(
                "http://localhost:8080/api/extract_text",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!extractResponse.ok) {
                const errorData = await extractResponse.json();
                setError(
                    errorData.error ||
                        "An error occurred while extracting text."
                );
                return;
            }

            const extractedData = await extractResponse.json();
            const notes = extractedData.notes || {};
            const flashcards = extractedData.flashcards || [];
            const mc_questions = extractedData.mc_questions || [];
            const createResponse = await fetch(
                "http://localhost:8080/api/create_course",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        clerk_id: userId,
                        course_name: name,
                        description: description,
                        exam_date: examDate,
                        notes: notes,
                        flashcards: flashcards,
                        mc_questions: mc_questions,
                        course_schedule: courseSchedule,
                    }),
                }
            );

            if (createResponse.ok) {
                onCourseCreated({
                    clerk_id: userId,
                    course_name: name,
                    description: description,
                    exam_date: examDate,
                    notes: notes,
                    flashcards: flashcards,
                    mc_questions: mc_questions,
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
                router.push("/client");
            } else {
                const errorData = await createResponse.json();
                if (createResponse.status === 403) {
                    setError(
                        "You've reached the maximum number of courses for free users. Please upgrade to premium for unlimited courses."
                    );
                } else {
                    setError(
                        errorData.message ||
                            "An error occurred while creating the course."
                    );
                }
            }
        } catch (err) {
            console.error("Error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
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
                        Choose Course Content (PDF, PNG, JPEG)
                    </div>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
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
