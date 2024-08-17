import React from "react";
import Link from "next/link";
import { formatURL } from '@/app/helpers';

const CourseList = ({ courses }) => {
  return (
    <div id="courses-container">
      <span id="courses-header">
        <h2>Your Courses</h2>
      </span>
      <hr />
      <div id="courses-list">
        {courses.length > 0 ? (
          courses.map((course, i) => (
            <div key={i} className="course-item">
              <Link href={`/${formatURL(course.course_name)}`}>
                <h4 className="course">{course.course_name}</h4>
              </Link>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3>No courses yet</h3>
            <p>Your courses will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
  
export default CourseList;