"use client";

import { useRouter } from 'next/navigation';
import styles from './course.css';

export default function Home({ courseObj }) {
  const router = useRouter();
  const { courseName } = router.query;

  if (router.isFallBack) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.main}>
        <h2>courseObj.course_name: {courseObj.course_name}</h2>
        <h2>courseName: {courseName}</h2>
        <p>This will be a dynamic page for course content</p>
    </div>
  );
}