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
    const [isPremium, setIsPremium] = useState(false);
    const [courseCount, setCourseCount] = useState(0);

    useEffect(() => {
        // Perform initial checks on page load
        const fetchPremiumStatusAndCourses = async () => {
            try {
                // Fetch the premium status
                const premiumResponse = await fetch(`http://localhost:8080/api/check_premium_status?clerk_id=${userId}`);
                if (premiumResponse.ok) {
                    const premiumData = await premiumResponse.json();
                    setIsPremium(premiumData.premium);
                    console.log("Premium Status:", premiumData.premium);
                } else {
                    console.error("Failed to fetch premium status.");
                }

                // Fetch the course count
                const coursesResponse = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}`);
                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    setCourseCount(coursesData.courses.length);
                    console.log("Course Count:", coursesData.courses.length);

                    // If not premium and course count is 2 or more, set an error
                    if (!isPremium && coursesData.courses.length >= 2) {
                        setError("You have reached the limit of 2 courses for free users. Upgrade to premium for unlimited courses.");
                    }
                } else {
                    console.error("Failed to fetch course count.");
                }
            } catch (error) {
                console.error("Error fetching premium status or course count:", error);
            }
        };

        if (userId) {
            fetchPremiumStatusAndCourses();
        }
    }, [userId]);

    useEffect(() => {
        // Update form validity
        setIsFormValid(
            name.trim() !== "" &&
            description.trim() !== "" &&
            examDate.trim() !== "" &&
            file !== null &&
            (isPremium || courseCount < 2)
        );
    }, [name, description, examDate, file, isPremium, courseCount]);

    const checkDuplicateCourseName = async (courseName) => {
        try {
            const response = await fetch(`http://localhost:8080/api/get_courses?clerk_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                return data.courses.some(
                    (course) => course.course_name.toLowerCase() === courseName.toLowerCase()
                );
            } else {
                console.error("Failed to fetch courses for duplicate check.");
                return false;
            }
        } catch (error) {
            console.error("Error checking for duplicate course name:", error);
            return false;
        }
    };

    const validateCourseName = (courseName) => {
        // Disallow special characters: [.!~*'()]
        const invalidChars = /[.!~*'()]/;
        return !invalidChars.test(courseName);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset error message

        if (!isPremium && courseCount >= 2) {
            setError("You have reached the limit of 2 courses for free users. Upgrade to premium for unlimited courses.");
            return;
        }

        if (!validateCourseName(name)) {
            setError("Course name contains invalid characters. Please avoid using [ . ! ~ * ' ( ) ]");
            return;
        }

        const isDuplicate = await checkDuplicateCourseName(name);
        if (isDuplicate) {
            setError("A course with this name already exists. Please choose a different name.");
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
                setError(errorData.error || "An error occurred while processing the file.");
                setLoading(false);
                return;
            }

            const extractedData = await extractResponse.json();
            const { notes = {}, flashcards = [], mc_questions = [] } = extractedData;

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
                });
                setName("");
                setDescription("");
                setExamDate("");
                setFile(null);
                setFileName("");
                setError("");
                router.push("/client"); // Redirect to course list page
            } else {
                const errorData = await createResponse.json();
                setError(errorData.message || "An error occurred while creating the course.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for disabling past dates
    const today = new Date().toISOString().split("T")[0];

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
                    min={today} // Disable past dates
                />
                <div className="file-input-wrapper">
                    <div className="file-input-button">
                        {fileName || "Choose Course Content (PDF, PNG, JPEG)"}
                    </div>
                    <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
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
